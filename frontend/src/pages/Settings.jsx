import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaWarehouse, FaPlus, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('warehouses');
  const [locations, setLocations] = useState([]);
  const [newLoc, setNewLoc] = useState({ name: '', type: 'internal' });

  // Fetch Locations
  const fetchLocations = () => {
    api.get('/locations').then(res => setLocations(res.data));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Create Location
  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/locations', newLoc);
      setNewLoc({ name: '', type: 'internal' });
      fetchLocations();
      alert("Location added successfully");
    } catch (err) { alert("Error adding location"); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* Settings Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button 
          className={`pb-2 px-4 font-semibold ${activeTab === 'warehouses' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('warehouses')}
        >
          Warehouse & Locations
        </button>
        <button 
          className={`pb-2 px-4 font-semibold ${activeTab === 'system' ? 'border-b-4 border-red-600 text-red-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('system')}
        >
          System & Maintenance
        </button>
      </div>

      {/* --- TAB CONTENT: WAREHOUSES --- */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-4 flex items-center text-gray-700">
                <FaPlus className="mr-2 text-blue-500" /> Add New Location
              </h3>
              <form onSubmit={handleAddLocation}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Location Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="e.g. Warehouse B, Rack 5"
                    value={newLoc.name}
                    onChange={e => setNewLoc({...newLoc, name: e.target.value})}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                  <select 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                    value={newLoc.type}
                    onChange={e => setNewLoc({...newLoc, type: e.target.value})}
                  >
                    <option value="internal">Internal (Physical Space)</option>
                    <option value="vendor">Vendor (Supplier)</option>
                    <option value="customer">Customer (Client)</option>
                  </select>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                  Create Location
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: List of Locations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Active Locations</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{locations.length} Total</span>
              </div>
              
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {locations.map(loc => (
                    <tr key={loc._id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-400" /> {loc.name}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold 
                          ${loc.type === 'internal' ? 'bg-green-100 text-green-700' : 
                            loc.type === 'vendor' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                          {loc.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                         <button className="text-red-400 hover:text-red-600" title="Cannot delete in demo">
                           <FaTrash />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB CONTENT: SYSTEM --- */}
      {activeTab === 'system' && (
        <div className="max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded p-6">
            <h3 className="text-red-800 font-bold text-lg mb-2">Danger Zone</h3>
            <p className="text-red-600 mb-4 text-sm">
              Advanced actions for system maintenance. Use with caution.
            </p>
            
            <div className="flex items-center justify-between bg-white p-4 rounded border border-red-100">
              <div>
                <p className="font-bold text-gray-800">Recalculate All Stock</p>
                <p className="text-sm text-gray-500">Fixes "Ghost Stock" by summing up all move history.</p>
              </div>
              <button 
                onClick={async () => {
                  if(window.confirm("Are you sure? This will overwrite total stock values based on move history.")) {
                    try {
                      const res = await api.post('/products/recalculate-stock');
                      alert(res.data.message);
                    } catch(err) {
                      alert("Failed: " + err.message);
                    }
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold text-sm"
              >
                Run Recalculation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;