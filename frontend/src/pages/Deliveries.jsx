import React, { useEffect, useState } from 'react';
import api from '../api';

const Deliveries = () => {
  const [allMoves, setAllMoves] = useState([]);
  const [filteredMoves, setFilteredMoves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Filter State
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1
  });

  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  // Fetch Deliveries Only
  const fetchMoves = () => api.get('/moves?type=delivery').then(res => {
    setAllMoves(res.data);
    setFilteredMoves(res.data);
  });
  
  useEffect(() => {
    fetchMoves();
    api.get('/products').then(res => setProducts(res.data));
    api.get('/locations').then(res => setLocations(res.data));
  }, []);

  // Apply Filters
  useEffect(() => {
    let filtered = [...allMoves];
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(move => move.status === statusFilter);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(move => 
        move.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        move.productId?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMoves(filtered);
  }, [statusFilter, searchTerm, allMoves]);

  // Validate (Deduct Stock)
  const handleValidate = async (id) => {
    if(!window.confirm("Confirm delivery? Stock will decrease.")) return;
    try {
      await api.put(`/moves/${id}/validate`);
      fetchMoves();
    } catch (err) { alert("Error validating"); }
  };

  // Submit New Delivery
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic: FROM Internal Warehouse TO Customer
      const mainWhLoc = locations.find(l => l.type === 'internal')?._id;
      const customerLoc = locations.find(l => l.type === 'customer')?._id;

      if (!mainWhLoc || !customerLoc) {
        alert("Missing Warehouse or Customer location data. Run seed script.");
        return;
      }

      await api.post('/moves', {
        type: 'delivery',
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        sourceLocation: mainWhLoc,     // FROM: Warehouse
        destinationLocation: customerLoc // TO: Customer
      });
      
      setShowForm(false);
      setFormData({ productId: '', quantity: 1 }); // Reset form
      fetchMoves();
    } catch (err) { alert("Failed to create delivery order"); }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-orange-600">Outgoing Deliveries</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
          {showForm ? 'Close Form' : '+ New Delivery Order'}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-orange-50 p-4 rounded border border-orange-200 mb-6">
          <h3 className="font-bold mb-2 text-orange-800">Create Delivery Order</h3>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium">Product to Ship</label>
              <select 
                className="border p-2 rounded w-64"
                onChange={e => setFormData({...formData, productId: e.target.value})}
                required
              >
                <option value="">Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.totalStock})</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Quantity</label>
              <input 
                type="number" 
                className="border p-2 rounded w-24"
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                required 
              />
            </div>

            <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Create Order</button>
          </form>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white p-4 rounded shadow mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Status</label>
          <select 
            className="border p-2 rounded"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Search</label>
          <input 
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Search by reference or product..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={() => { setStatusFilter('all'); setSearchTerm(''); }}
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
              <th className="text-left p-4">Reference</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Qty</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMoves.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No deliveries found</td>
              </tr>
            ) : (
              filteredMoves.map(move => (
                <tr key={move._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm text-gray-600">{move.reference}</td>
                  <td className="p-4">{move.destinationLocation?.name}</td>
                  <td className="p-4 font-medium">{move.productId?.name}</td>
                  <td className="p-4 font-bold text-red-500">-{move.quantity}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${move.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {move.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {move.status === 'draft' && (
                      <button onClick={() => handleValidate(move._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                        Validate
                      </button>
                    )}
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

export default Deliveries;