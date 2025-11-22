import React, { useEffect, useState } from 'react';
import api from '../api';

const InternalTransfers = () => {
  const [moves, setMoves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    sourceId: '',
    destId: ''
  });

  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const fetchMoves = () => api.get('/moves?type=internal').then(res => setMoves(res.data));
  
  useEffect(() => {
    fetchMoves();
    api.get('/products').then(res => setProducts(res.data));
    api.get('/locations').then(res => setLocations(res.data));
  }, []);

  const handleValidate = async (id) => {
    try {
      await api.put(`/moves/${id}/validate`);
      fetchMoves();
    } catch (err) { alert("Error validating"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.sourceId === formData.destId) {
      alert("Source and Destination cannot be the same!");
      return;
    }
    try {
      await api.post('/moves', {
        type: 'internal',
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        sourceLocation: formData.sourceId,
        destinationLocation: formData.destId
      });
      setShowForm(false);
      fetchMoves();
    } catch (err) { alert("Failed to create transfer"); }
  };

  // Filter locations to show only "Internal" types (Warehouses, Racks)
  const internalLocs = locations.filter(l => l.type === 'internal');

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-600">Internal Transfers</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          {showForm ? 'Close Form' : '+ New Transfer'}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-indigo-50 p-4 rounded border border-indigo-200 mb-6">
          <h3 className="font-bold mb-2 text-indigo-800">Move Stock Internally</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            
            <div className="col-span-2">
              <label className="block text-sm font-medium">Product</label>
              <select className="border p-2 rounded w-full" required onChange={e => setFormData({...formData, productId: e.target.value})}>
                <option value="">Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">From (Source)</label>
              <select className="border p-2 rounded w-full" required onChange={e => setFormData({...formData, sourceId: e.target.value})}>
                <option value="">Select Source</option>
                {internalLocs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">To (Destination)</label>
              <select className="border p-2 rounded w-full" required onChange={e => setFormData({...formData, destId: e.target.value})}>
                <option value="">Select Destination</option>
                {internalLocs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Qty</label>
              <input type="number" className="border p-2 rounded w-full" min="1" required 
                value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>

            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 col-span-5 md:col-span-1">
              Move
            </button>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-4">Reference</th>
              <th className="text-left p-4">From</th>
              <th className="text-left p-4">To</th>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Qty</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {moves.map(move => (
              <tr key={move._id} className="border-b">
                <td className="p-4 font-mono text-sm">{move.reference}</td>
                <td className="p-4 text-red-600">{move.sourceLocation?.name}</td>
                <td className="p-4 text-green-600">{move.destinationLocation?.name}</td>
                <td className="p-4">{move.productId?.name}</td>
                <td className="p-4 font-bold">{move.quantity}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${move.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {move.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  {move.status === 'draft' && (
                    <button onClick={() => handleValidate(move._id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                      Validate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternalTransfers;