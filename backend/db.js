const { Pool } = require('pg');

const hasConnectionString = Boolean(process.env.DATABASE_URL);

const pool = hasConnectionString
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      allowExitOnIdle: true,
    })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      allowExitOnIdle: true,
    });

function getTargetLabel() {
  if (process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL);
      return `${parsed.hostname}:${parsed.port || 5432}`;
    } catch {
      return process.env.DATABASE_URL;
    }
  }

  return `${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}`;
}

async function query(text, params) {
  return pool.query(text, params);
}

async function initDatabase() {
  try {
    await query('SELECT 1');

    await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Staff',
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      otp TEXT,
      otp_expires TIMESTAMPTZ
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT 'Uncategorized',
      uom TEXT NOT NULL DEFAULT 'Units',
      cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
      low_stock_threshold NUMERIC(12,2) NOT NULL DEFAULT 10
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS stock_moves (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL,
      product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
      source_location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
      destination_location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
      quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      scheduled_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      responsible_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

    return true;
  } catch (error) {
    error.message = `Unable to connect to Postgres at ${getTargetLabel()}. Set DATABASE_URL or PGHOST to a reachable database, or verify AWS security group and network access. Original error: ${error.message}`;
    throw error;
  }
}

module.exports = { pool, query, initDatabase };