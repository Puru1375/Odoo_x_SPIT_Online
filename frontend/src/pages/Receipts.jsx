import React, { useEffect, useState } from 'react';
import api from '../api';

const Receipts = () => {
  const [moves, setMoves] = useState([]);
  
  // Fetch receipts
  const fetchMoves = () => {
    api.get('/moves?type=receipt').then(res => setMoves(res.data));
  };

  useEffect(() => {
    fetchMoves();
  }, []);

  // VALIDATE FUNCTION (The Core Feature)
  const handleValidate = async (id) => {
    if(!window.confirm("Confirm reception of goods? Stock will increase.")) return;
    
    try {
      await api.put(`/moves/${id}/validate`);
      alert("Stock Updated Successfully!");
      fetchMoves(); // Refresh data
    } catch (err) {
      alert("Error validating");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Incoming Receipts</h1>

      <div className="bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-4">Reference</th>
              <th className="text-left p-4">Source (Vendor)</th>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Quantity</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {moves.map(move => (
              <tr key={move._id} className="border-b">
                <td className="p-4 font-mono text-sm">{move.reference}</td>
                <td className="p-4">{move.sourceLocation?.name}</td>
                <td className="p-4">{move.productId?.name}</td>
                <td className="p-4 font-bold text-blue-600">+{move.quantity}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${move.status === 'done' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {move.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  {move.status === 'draft' && (
                    <button 
                      onClick={() => handleValidate(move._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
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

export default Receipts;