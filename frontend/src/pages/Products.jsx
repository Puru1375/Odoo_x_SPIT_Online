import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaEye, FaEdit } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const navigate = useNavigate();

  const fetchProducts = () => api.get('/products').then(res => setProducts(res.data));
  useEffect(() => { fetchProducts(); }, []);

  // Get Unique Categories
  const categories = [...new Set(products.map(p => p.category))];

  // Apply Filters
  useEffect(() => {
    let filtered = [...products];
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [categoryFilter, searchTerm, products]);

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button 
          onClick={() => navigate('/products/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Product
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded shadow mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Category</label>
          <select 
            className="border p-2 rounded"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Search</label>
          <input 
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Search by SKU or Name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={() => { setCategoryFilter('all'); setSearchTerm(''); }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
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
              <th className="p-4 text-left">Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">No products found</td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm text-gray-600">{p.sku}</td>
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
                  <td className="p-4">
                    <button 
                      onClick={() => navigate(`/products/${p._id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Manage
                    </button>
                  </td>
                  <td className="p-4 cursor-pointer text-gray-400">
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;