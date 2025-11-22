import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

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

  const user = JSON.parse(localStorage.getItem("user"));
  const isManager = user?.role === "Manager";

  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const navigate = useNavigate();

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
  
  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-orange-600">Outgoing Deliveries</h1>
        <button onClick={() => navigate('/deliveries/new')}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        >New Delivery Order</button>
      </div>


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
              <th className="text-left p-4">From</th>
              <th className="text-left p-4">To</th>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Qty</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
              <th>  </th>
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
                  <td className="p-4">{move.sourceLocation?.name}</td>
                  <td className="p-4">{move.destinationLocation?.name}</td>
                  <td className="p-4 font-medium">{move.productId?.name}</td>
                  <td className="p-4 font-bold text-red-500">-{move.quantity}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${move.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {move.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {move.status === 'draft' && (
                      isManager ? (
                        <button 
                          onClick={() => handleValidate(move._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >Validate</button>
                      ) : (
                        <span className="text-gray-500 italic text-sm">Manager Only</span>
                      )
                    )}
                    {move.status === 'done' && (
                      <span className="text-sm text-gray-500 italic">No Actions</span>
                    )}
                    
                  </td>
                  <td className="cursor-pointer text-blue-600" onClick={() => navigate(`/deliveries/${move._id}`)}>View</td>
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