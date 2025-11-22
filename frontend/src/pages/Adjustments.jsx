import React, { useEffect, useState } from 'react';
import api from '../api';

const Adjustments = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [physicalCount, setPhysicalCount] = useState('');
  const [reason, setReason] = useState('Inventory Count / Damage');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const handleAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const res = await api.post('/moves/adjustment', {
        productId: selectedProduct,
        physicalCount: parseInt(physicalCount),
        reason
      });
      setMessage({ type: 'success', text: res.data.message });
      // Refresh product list to see new stock
      api.get('/products').then(res => setProducts(res.data));
      setPhysicalCount('');
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to adjust stock" });
    }
  };

  // Find selected product details to show current stock
  const activeProd = products.find(p => p._id === selectedProduct);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">Stock Adjustment</h2>
      <p className="mb-4 text-gray-600">Use this to correct stock levels (e.g., Damaged items, Theft, Counting errors).</p>

      {message && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleAdjustment}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Select Product</label>
          <select 
            className="w-full border p-2 rounded"
            onChange={e => setSelectedProduct(e.target.value)}
            required
          >
            <option value="">-- Choose Product --</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>{p.name} (Current System Stock: {p.totalStock})</option>
            ))}
          </select>
        </div>

        {activeProd && (
           <div className="mb-6 bg-gray-50 p-4 rounded border">
             <p><strong>System Stock:</strong> {activeProd.totalStock}</p>
             <p className="text-sm text-gray-500">Enter the actual physical count below. The system will calculate the difference.</p>
           </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Actual Physical Count</label>
          <input 
            type="number" 
            className="w-full border p-2 rounded font-bold text-lg"
            placeholder="e.g. 97"
            value={physicalCount}
            onChange={e => setPhysicalCount(e.target.value)}
            required 
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Reason</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>

        <button className="w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700 font-bold">
          Update Stock Level
        </button>
      </form>
    </div>
  );
};

export default Adjustments;