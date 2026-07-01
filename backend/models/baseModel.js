const { randomUUID } = require('crypto');
const { query } = require('../db');

function toDbName(propName, columnMap) {
  return columnMap[propName] || propName;
}

function fromDbRow(row, columnMap) {
  const reverseMap = Object.fromEntries(Object.entries(columnMap).map(([prop, column]) => [column, prop]));
  const result = {};

  for (const [key, value] of Object.entries(row)) {
    const propName = reverseMap[key] || key;
    result[propName] = value;
  }

  if (Object.prototype.hasOwnProperty.call(result, 'id')) {
    result._id = result.id;
    delete result.id;
  }

  return result;
}

function toDbRow(data, columnMap) {
  const row = {};

  for (const [propName, value] of Object.entries(data)) {
    if (propName === '_id' || propName === 'id' || typeof value === 'function') {
      continue;
    }

    const columnName = toDbName(propName, columnMap);
    row[columnName] = value;
  }

  if (data._id) {
    row.id = data._id;
  }

  return row;
}

class Query {
  constructor(modelClass, filter = {}, options = {}) {
    this.modelClass = modelClass;
    this.filter = filter;
    this.options = options;
    this.selectFields = null;
    this.populateFields = [];
    this.sortSpec = null;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  populate(field, fields) {
    this.populateFields.push({ field, fields });
    return this;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  async exec() {
    const { text, params } = this.modelClass.buildSelect(this.filter, this.options);
    const result = await query(text, params);
    let rows = result.rows.map((row) => this.modelClass.fromRow(row));

    if (this.selectFields) {
      rows = rows.map((row) => this.modelClass.applySelect(row, this.selectFields));
    }

    if (this.populateFields.length) {
      for (const populateConfig of this.populateFields) {
        rows = await this.modelClass.populateRows(rows, populateConfig.field, populateConfig.fields);
      }
    }

    if (this.sortSpec) {
      rows = this.modelClass.sortRows(rows, this.sortSpec);
    }

    if (this.options.single) {
      return rows[0] || null;
    }

    return rows;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

class BaseModel {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static get tableName() {
    throw new Error('tableName must be defined');
  }

  static get columnMap() {
    return {};
  }

  static get relationMap() {
    return {};
  }

  static get defaultSort() {
    return null;
  }

  static fromRow(row) {
    const data = fromDbRow(row, this.columnMap);
    const transforms = this.fieldTransforms || {};

    for (const [field, transform] of Object.entries(transforms)) {
      if (data[field] !== undefined && data[field] !== null) {
        data[field] = transform(data[field]);
      }
    }

    return new this(data);
  }

  static applySelect(instance, fields) {
    if (!fields) {
      return instance;
    }

    const fieldList = fields.trim().split(/\s+/).filter(Boolean);
    const data = { ...instance };

    if (fieldList.length === 1 && fieldList[0].startsWith('-')) {
      delete data[fieldList[0].slice(1)];
      return new this(data);
    }

    const allowed = new Set(fieldList);
    const selected = {};
    for (const key of Object.keys(data)) {
      if (allowed.has(key)) {
        selected[key] = data[key];
      }
    }

    return new this(selected);
  }

  static sortRows(rows, spec) {
    const [field, direction] = Object.entries(spec)[0] || [];
    if (!field) {
      return rows;
    }

    const multiplier = direction === -1 ? -1 : 1;
    return [...rows].sort((left, right) => {
      const leftValue = left[field];
      const rightValue = right[field];

      if (leftValue == null && rightValue == null) return 0;
      if (leftValue == null) return 1;
      if (rightValue == null) return -1;

      if (leftValue < rightValue) return -1 * multiplier;
      if (leftValue > rightValue) return 1 * multiplier;
      return 0;
    });
  }

  static buildWhere(filter = {}) {
    const clauses = [];
    const params = [];

    for (const [key, value] of Object.entries(filter)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        continue;
      }

      params.push(value);
      clauses.push(`${toDbName(key, this.columnMap)} = $${params.length}`);
    }

    return {
      text: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
      params,
    };
  }

  static buildSelect(filter = {}, options = {}) {
    const { text: whereText, params } = this.buildWhere(filter);
    let text = `SELECT * FROM ${this.tableName} ${whereText}`.trim();

    if (options.limit) {
      text += ` LIMIT ${Number(options.limit)}`;
    }

    return { text, params };
  }

  static find(filter = {}) {
    return new Query(this, filter);
  }

  static findOne(filter = {}) {
    return new Query(this, filter, { single: true, limit: 1 });
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async countDocuments(filter = {}) {
    const { text: whereText, params } = this.buildWhere(filter);
    const result = await query(`SELECT COUNT(*)::int AS count FROM ${this.tableName} ${whereText}`.trim(), params);
    return result.rows[0]?.count || 0;
  }

  static async deleteMany(filter = {}) {
    const { text: whereText, params } = this.buildWhere(filter);
    await query(`DELETE FROM ${this.tableName} ${whereText}`.trim(), params);
  }

  static async create(data = {}) {
    const instance = new this(data);
    await instance.save();
    return instance;
  }

  static async findByIdAndUpdate(id, update = {}, _options = {}) {
    const instance = await this.findById(id);
    if (!instance) {
      return null;
    }

    Object.assign(instance, update);
    await instance.save();
    return instance;
  }

  static async populateRows(rows, field, fields) {
    const relation = this.relationMap[field];
    if (!relation) {
      return rows;
    }

    const relatedModel = relation.model;
    const selectedFields = fields ? fields.trim().split(/\s+/).filter(Boolean) : null;

    const populatedRows = [];
    for (const row of rows) {
      const relatedId = row[field];
      if (!relatedId) {
        populatedRows.push(row);
        continue;
      }

      const related = await relatedModel.findById(relatedId);
      if (related) {
        const relatedObject = { ...related };
        if (selectedFields) {
          const projected = {};
          for (const key of selectedFields) {
            if (Object.prototype.hasOwnProperty.call(relatedObject, key)) {
              projected[key] = relatedObject[key];
            }
          }
          row[field] = { _id: relatedObject._id, ...projected };
        } else {
          row[field] = relatedObject;
        }
      }

      populatedRows.push(row);
    }

    return populatedRows;
  }

  async save() {
    const data = toDbRow(this, this.constructor.columnMap);

    if (!this._id) {
      this._id = randomUUID();
      data.id = this._id;
    }

    const columns = Object.keys(data);
    const values = columns.map((column) => data[column]);
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    await query(
      `INSERT INTO ${this.constructor.tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) ON CONFLICT (id) DO UPDATE SET ${columns.filter((column) => column !== 'id').map((column) => `${column} = EXCLUDED.${column}`).join(', ')}`,
      values
    );

    return this;
  }
}

module.exports = { BaseModel, Query, fromDbRow, toDbRow };