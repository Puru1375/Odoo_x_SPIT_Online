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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Product Management</h1>
        <button 
          onClick={() => navigate('/products/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
        >
          + New Product
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-3 sm:p-4 rounded shadow mb-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-semibold mb-1">Category</label>
          <select 
            className="border p-2 rounded w-full"
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
        
        <div className="flex items-end w-full sm:w-auto">
          <button 
            onClick={() => { setCategoryFilter('all'); setSearchTerm(''); }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 w-full sm:w-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-2 sm:p-4 text-left text-xs sm:text-sm">SKU</th>
              <th className="p-2 sm:p-4 text-left text-xs sm:text-sm">Name</th>
              <th className="p-2 sm:p-4 text-left text-xs sm:text-sm hidden md:table-cell">Category</th>
              <th className="p-2 sm:p-4 text-left text-xs sm:text-sm hidden lg:table-cell">UoM</th>
              <th className="p-2 sm:p-4 text-left text-xs sm:text-sm">Stock</th>
              <th className="p-2 sm:p-4 text-left text-xs sm:text-sm hidden xl:table-cell">Reorder Rule</th>
              <th className="p-2 sm:p-4 text-left text-xs sm:text-sm">Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500 text-xs sm:text-sm">No products found</td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="p-2 sm:p-4 font-mono text-xs sm:text-sm text-gray-600">{p.sku}</td>
                  <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">{p.name}</td>
                  <td className="p-2 sm:p-4 text-xs sm:text-sm hidden md:table-cell">{p.category}</td>
                  <td className="p-2 sm:p-4 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{p.uom}</td>
                  <td className={`p-2 sm:p-4 font-bold text-xs sm:text-sm ${p.totalStock <= p.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                    {p.totalStock}
                  </td>
                  <td className="p-2 sm:p-4 text-xs text-gray-500 hidden xl:table-cell">
                    Min: {p.lowStockThreshold}
                    {p.totalStock <= p.lowStockThreshold && <span className="ml-2 text-red-500 font-bold">(ORDER NOW)</span>}
                  </td>
                  <td className="p-2 sm:p-4">
                    <button 
                      onClick={() => navigate(`/products/${p._id}`)}
                      className="bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm hover:bg-blue-700"
                    >
                      Manage
                    </button>
                  </td>
                  <td className="p-2 sm:p-4 cursor-pointer text-gray-400">
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default Products;