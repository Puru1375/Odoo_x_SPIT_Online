import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FaSearch, FaEdit, FaEye } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form State matching PDF requirements
  const [formData, setFormData] = useState({
    _id: null, name: '', sku: '', category: '', uom: 'Units', 
    costPrice: '', lowStockThreshold: 10, initialStock: ''
  });

  const fetchProducts = () => api.get('/products').then(res => setProducts(res.data));
  useEffect(() => { fetchProducts(); }, []);

  // Open Create Modal
  const openCreate = () => {
    setFormData({ _id: null, name: '', sku: '', category: '', uom: 'Units', costPrice: '', lowStockThreshold: 10, initialStock: '' });
    setIsEditMode(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEdit = (product) => {
    setFormData({ ...product, initialStock: 0 }); // Cannot change initial stock on edit
    setIsEditMode(true);
    setShowModal(true);
  };

  // Handle Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/products/${formData._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      fetchProducts();
      alert(isEditMode ? "Product Updated" : "Product Created");
    } catch (err) { alert("Error saving product"); }
  };

  // Get Unique Categories for Filter Header (Optional Bonus)
  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <div className="flex gap-3">
          <div className="relative">
            <input type="text" placeholder="Search SKU/Name..." className="pl-10 pr-4 py-2 border rounded-lg"
              onChange={e => setSearch(e.target.value)} />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
            + Create Product
          </button>
        </div>
      </div>

      {/* Categories "Pills" (Quick Filter Visual) */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-bold">All</span>
        {categories.map((c, i) => <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">{c}</span>)}
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 text-left">SKU</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">UoM</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Reorder Rule</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono text-sm text-gray-500">{p.sku}</td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-sm">{p.category}</td>
                <td className="p-4 text-sm text-gray-500">{p.uom}</td>
                <td className={`p-4 font-bold ${p.totalStock <= p.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                  {p.totalStock}
                </td>
                <td className="p-4 text-xs text-gray-500">
                  Min: {p.lowStockThreshold}
                  {p.totalStock <= p.lowStockThreshold && <span className="ml-2 text-red-500 font-bold">(ORDER NOW)</span>}
                </td>
                <td className="p-4 flex gap-2">
                  <Link to={`/products/${p._id}`} className="text-blue-500 hover:text-blue-700" title="View Stock per Location">
                    <FaEye size={18} />
                  </Link>
                  <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-gray-700" title="Edit">
                    <FaEdit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE/UPDATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Update Product' : 'Create New Product'}</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold mb-1">Product Name</label>
                  <input className="border w-full p-2 rounded" required value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">SKU / Code</label>
                  <input className="border w-full p-2 rounded" required value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <input className="border w-full p-2 rounded" list="cat-list" value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})} />
                  <datalist id="cat-list">
                    <option value="Raw Materials" />
                    <option value="Finished Goods" />
                    <option value="Consumables" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Unit of Measure</label>
                  <select className="border w-full p-2 rounded" value={formData.uom}
                    onChange={e => setFormData({...formData, uom: e.target.value})}>
                    <option value="Units">Units</option>
                    <option value="kg">kg</option>
                    <option value="m">meters</option>
                    <option value="L">Liters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Reorder Rule (Min)</label>
                  <input type="number" className="border w-full p-2 rounded" required value={formData.lowStockThreshold}
                    onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})} />
                </div>
                
                {!isEditMode && (
                  <div className="col-span-2 bg-gray-50 p-2 rounded border">
                    <label className="block text-xs font-bold mb-1 text-blue-600">Initial Stock (Optional)</label>
                    <input type="number" className="border w-full p-2 rounded" placeholder="0"
                      onChange={e => setFormData({...formData, initialStock: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;