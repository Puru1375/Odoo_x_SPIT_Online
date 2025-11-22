import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaWarehouse, FaPlus } from 'react-icons/fa';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [newLoc, setNewLoc] = useState({ name: '', type: 'internal' });

  // Fetch existing locations
  const fetchLocations = () => {
    api.get('/locations').then(res => setLocations(res.data));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle Create
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLoc.name) return;

    try {
      await api.post('/locations', newLoc);
      alert("Location Added!");
      setNewLoc({ name: '', type: 'internal' }); // Reset form
      fetchLocations(); // Refresh list
    } catch (err) {
      alert("Error adding location");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FaWarehouse className="mr-3 text-gray-600" /> Warehouse & Location Settings
      </h1>

      {/* --- ADD NEW LOCATION FORM --- */}
      <div className="bg-white p-6 rounded shadow-md mb-8 border-t-4 border-blue-600">
        <h3 className="font-bold text-lg mb-4">Add New Location</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold mb-1">Location Name</label>
            <input 
              type="text" 
              placeholder="e.g. Warehouse 2, Rack B, Supplier Acme" 
              className="w-full border p-2 rounded"
              value={newLoc.name}
              onChange={e => setNewLoc({ ...newLoc, name: e.target.value })}
            />
          </div>
          
          <div className="w-64">
            <label className="block text-sm font-bold mb-1">Type</label>
            <select 
              className="w-full border p-2 rounded"
              value={newLoc.type}
              onChange={e => setNewLoc({ ...newLoc, type: e.target.value })}
            >
              <option value="internal">Internal (Warehouse/Rack)</option>
              <option value="vendor">Vendor (Supplier)</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded flex items-center hover:bg-blue-700">
            <FaPlus className="mr-2" /> Add
          </button>
        </form>
      </div>

      {/* --- LOCATION LIST --- */}
      <div className="bg-white rounded shadow overflow-hidden">
        <h3 className="font-bold text-lg p-4 border-b bg-gray-50">Existing Locations</h3>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">ID (System)</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{loc.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs text-white
                    ${loc.type === 'internal' ? 'bg-blue-500' : 
                      loc.type === 'vendor' ? 'bg-purple-500' : 'bg-orange-500'}`
                  }>
                    {loc.type.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-gray-400 font-mono text-xs">{loc._id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Locations;