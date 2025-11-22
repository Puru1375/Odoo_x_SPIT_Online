import React, { useEffect, useState } from 'react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0
  });

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inventory Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>

        {/* Card 2 - Low Stock Alert */}
        <div className="bg-white p-6 rounded shadow-md border-l-4 border-red-500">
          <h3 className="text-gray-500">Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-red-600">{stats.lowStockCount}</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded shadow-md border-l-4 border-green-500">
          <h3 className="text-gray-500">Pending Receipts</h3>
          <p className="text-3xl font-bold">{stats.pendingReceipts}</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded shadow-md border-l-4 border-orange-500">
          <h3 className="text-gray-500">Pending Deliveries</h3>
          <p className="text-3xl font-bold">{stats.pendingDeliveries}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;