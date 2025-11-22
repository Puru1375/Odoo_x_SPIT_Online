import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaSearch } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // New Product State
  const [newProd, setNewProd] = useState({
    name: '', sku: '', category: '', costPrice: '', lowStockThreshold: 10
  });

  const fetchProducts = () => api.get('/products').then(res => setProducts(res.data));

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', newProd);
      alert("Product Created!");
      setShowModal(false);
      fetchProducts();
    } catch (err) { alert("Error creating product"); }
  };

  // FILTER LOGIC (Smart Search)
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Header with Search & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        
        <div className="flex gap-4">
          {/* SEARCH BAR */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search SKU or Name..." 
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow">
            + Create Product
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-4">SKU</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-left p-4">Cost</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono text-sm text-gray-500">{p.sku}</td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-sm bg-gray-50 rounded">{p.category || 'Uncategorized'}</td>
                <td className={`p-4 font-bold ${p.totalStock < p.lowStockThreshold ? 'text-red-500' : 'text-green-600'}`}>
                  {p.totalStock}
                </td>
                <td className="p-4">${p.costPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleCreate}>
              <input className="border w-full p-2 mb-3 rounded" placeholder="Product Name" required
                onChange={e => setNewProd({...newProd, name: e.target.value})} />
              
              <input className="border w-full p-2 mb-3 rounded" placeholder="SKU (e.g. ST-001)" required
                onChange={e => setNewProd({...newProd, sku: e.target.value})} />
              
              <input className="border w-full p-2 mb-3 rounded" placeholder="Category (e.g. Raw Material)" 
                onChange={e => setNewProd({...newProd, category: e.target.value})} />
              
              <div className="flex gap-2 mb-3">
                <input type="number" className="border w-1/2 p-2 rounded" placeholder="Cost Price" required
                  onChange={e => setNewProd({...newProd, costPrice: e.target.value})} />
                <input type="number" className="border w-1/2 p-2 rounded" placeholder="Min Stock Alert" required
                  onChange={e => setNewProd({...newProd, lowStockThreshold: e.target.value})} />
              </div>

              <div className="flex justify-end gap-2 mt-4">
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