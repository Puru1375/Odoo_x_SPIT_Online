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

  const user = JSON.parse(localStorage.getItem("user"));
  const isManager = user?.role === "Manager";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">Internal Transfers</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full sm:w-auto text-sm sm:text-base">
          {showForm ? 'Close Form' : '+ New Transfer'}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-indigo-50 p-3 sm:p-4 rounded border border-indigo-200 mb-4 sm:mb-6">
          <h3 className="font-bold mb-2 text-indigo-800 text-sm sm:text-base">Move Stock Internally</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 items-stretch md:items-end">
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium mb-1">Product</label>
              <select className="border p-2 rounded w-full text-sm sm:text-base" required onChange={e => setFormData({...formData, productId: e.target.value})}>
                <option value="">Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs sm:text-sm font-medium mb-1">From (Source)</label>
              <select className="border p-2 rounded w-full text-sm sm:text-base" required onChange={e => setFormData({...formData, sourceId: e.target.value})}>
                <option value="">Select Source</option>
                {internalLocs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs sm:text-sm font-medium mb-1">To (Destination)</label>
              <select className="border p-2 rounded w-full text-sm sm:text-base" required onChange={e => setFormData({...formData, destId: e.target.value})}>
                <option value="">Select Destination</option>
                {internalLocs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs sm:text-sm font-medium mb-1">Qty</label>
              <input type="number" className="border p-2 rounded w-full text-sm sm:text-base" min="1" required 
                value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>

            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 col-span-1 md:col-span-1 text-sm sm:text-base">
              Move
            </button>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">Reference</th>
              <th className="text-left p-2 sm:p-4 text-xs sm:text-sm hidden sm:table-cell">From</th>
              <th className="text-left p-2 sm:p-4 text-xs sm:text-sm hidden sm:table-cell">To</th>
              <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">Product</th>
              <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">Qty</th>
              <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">Status</th>
              <th className="text-left p-2 sm:p-4 text-xs sm:text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {moves.map(move => (
              <tr key={move._id} className="border-b">
                <td className="p-2 sm:p-4 font-mono text-xs">{move.reference}</td>
                <td className="p-2 sm:p-4 text-red-600 text-xs hidden sm:table-cell">{move.sourceLocation?.name}</td>
                <td className="p-2 sm:p-4 text-green-600 text-xs hidden sm:table-cell">{move.destinationLocation?.name}</td>
                <td className="p-2 sm:p-4 text-xs sm:text-sm">{move.productId?.name}</td>
                <td className="p-2 sm:p-4 font-bold text-xs sm:text-sm">{move.quantity}</td>
                <td className="p-2 sm:p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${move.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {move.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-2 sm:p-4">
                  {move.status === 'draft' && isManager ? (
                    <button 
                      onClick={() => handleValidate(move._id)} 
                      className="bg-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded hover:bg-indigo-700 text-xs sm:text-sm"
                    >
                      Validate
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 italic">No Actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default InternalTransfers;