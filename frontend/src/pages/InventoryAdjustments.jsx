import React, { useEffect, useState } from 'react';
import api from '../api';

const InventoryAdjustments = () => {
  const [moves, setMoves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    locationId: ''
  });

  // Dropdown Data
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const fetchMoves = () => api.get('/moves?type=adjustment').then(res => setMoves(res.data));
  
  useEffect(() => {
    fetchMoves();
    // Load data for dropdowns
    api.get('/products').then(res => setProducts(res.data));
    api.get('/locations').then(res => setLocations(res.data));
  }, []);

  // Validate Move Logic
  const handleValidate = async (id) => {
    if(!window.confirm("Validate adjustment? Stock will be updated.")) return;
    try {
      await api.put(`/moves/${id}/validate`);
      fetchMoves();
    } catch (err) { alert("Error"); }
  };

  // Submit New Adjustment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // For adjustment, we can treat positive as gain, negative as loss.
      // We'll set source/dest based on sign for clarity in DB, though backend logic just adds quantity.
      // If Qty > 0: Source = Virtual, Dest = Location
      // If Qty < 0: Source = Location, Dest = Virtual
      
      const virtualLoc = locations.find(l => l.type === 'virtual')?._id; // Assuming we have a virtual location or similar
      // If no virtual location, we just leave it null.

      await api.post('/moves', {
        type: 'adjustment',
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        sourceLocation: parseInt(formData.quantity) < 0 ? formData.locationId : virtualLoc,
        destinationLocation: parseInt(formData.quantity) > 0 ? formData.locationId : virtualLoc
      });
      setShowForm(false);
      fetchMoves();
    } catch (err) { alert("Failed to create adjustment"); }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory Adjustments</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded">
          {showForm ? 'Close Form' : '+ New Adjustment'}
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded border mb-6">
          <h3 className="font-bold mb-2">Create New Adjustment</h3>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm">Product</label>
              <select 
                className="border p-2 rounded w-48"
                onChange={e => setFormData({...formData, productId: e.target.value})}
                required
              >
                <option value="">Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm">Location</label>
              <select 
                className="border p-2 rounded w-48"
                onChange={e => setFormData({...formData, locationId: e.target.value})}
                required
              >
                <option value="">Select Location</option>
                {locations.map(l => <option key={l._id} value={l._id}>{l.name} ({l.type})</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm">Quantity Change</label>
              <input 
                type="number" 
                className="border p-2 rounded w-32"
                placeholder="+/- Qty"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                required 
              />
              <p className="text-xs text-gray-500">Use negative for loss</p>
            </div>

            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save Draft</button>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-4">Reference</th>
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
                <td className="p-4">{move.productId?.name}</td>
                <td className={`p-4 ${move.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {move.quantity > 0 ? '+' : ''}{move.quantity}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${move.status === 'done' ? 'bg-green-200 text-green-800' : 'bg-gray-200'}`}>
                    {move.status}
                  </span>
                </td>
                <td className="p-4">
                  {move.status === 'draft' && (
                    <button onClick={() => handleValidate(move._id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
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

export default InventoryAdjustments;
