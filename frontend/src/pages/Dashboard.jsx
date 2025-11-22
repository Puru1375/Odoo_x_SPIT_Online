import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FaHistory, FaArrowUp, FaArrowDown, FaExchangeAlt, FaCheckCircle, FaClock, FaBox, FaArrowRight } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0
  });
  const [recentMoves, setRecentMoves] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch Stats
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));

    // Fetch Recent Moves (Limit 10)
    api.get('/moves')
      .then(res => setRecentMoves(res.data.slice(0, 10)))
      .catch(err => console.error(err));

    // Fetch Products (Top 12 by Stock)
    api.get('/products')
      .then(res => {
        const sortedProducts = res.data.sort((a, b) => b.totalStock - a.totalStock).slice(0, 12);
        setProducts(sortedProducts);
      })
      .catch(err => console.error(err));
  }, []);

  const getMoveIcon = (type) => {
    switch (type) {
      case 'receipt': return <FaArrowDown className="text-green-500" />;
      case 'delivery': return <FaArrowUp className="text-blue-500" />;
      case 'internal': return <FaExchangeAlt className="text-orange-500" />;
      case 'adjustment': return <FaCheckCircle className="text-purple-500" />;
      default: return <FaHistory />;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Inventory Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Total Products</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProducts}</p>
        </div>

        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStockCount}</p>
        </div>

        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Pending Receipts</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingReceipts}</p>
        </div>

        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-orange-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Pending Deliveries</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingDeliveries}</p>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center">
            <FaBox className="mr-2 text-blue-600" /> Top Stock Overview
          </h2>
          <Link to="/products" className="text-sm text-blue-600 hover:underline flex items-center">
            View All Products <FaArrowRight className="ml-1 text-xs" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.slice(0, 5).map((product, index) => (
            <div 
              key={product._id} 
              className={`bg-white p-4 rounded shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between
                ${index >= 2 ? 'hidden sm:block' : ''}
                ${index >= 2 ? 'sm:hidden md:block' : ''}
                ${index >= 3 ? 'md:hidden lg:block' : ''}
                ${index >= 4 ? 'lg:hidden xl:block' : ''}
              `}
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 truncate w-full" title={product.name}>{product.name}</h3>
                </div>
                <div className="flex justify-between items-center mt-1">
                   <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">{product.sku}</span>
                   <p className="text-xs text-gray-500">{product.category || 'Uncat'}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-end justify-between">
                <div>
                  <span className={`text-xl font-bold ${product.totalStock <= product.lowStockThreshold ? 'text-red-600' : 'text-blue-600'}`}>
                    {product.totalStock}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">{product.uom}</span>
                </div>
                {product.totalStock <= product.lowStockThreshold && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Low</span>
                )}
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400 italic bg-gray-50 rounded border border-dashed">
              No products found.
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions History */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-700 flex items-center">
            <FaHistory className="mr-2 text-gray-500" /> Recent Transactions History
          </h2>
          <span className="text-xs text-gray-500">Last 10 Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Type</th>
                <th className="p-4">Product</th>
                <th className="p-4">From / To</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentMoves.length > 0 ? (
                recentMoves.map(move => (
                  <tr key={move._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono text-xs text-gray-600">{move.reference}</td>
                    <td className="p-4 capitalize flex items-center gap-2">
                      {getMoveIcon(move.type)} {move.type}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {move.productId?.name || 'Unknown Product'}
                    </td>
                    <td className="p-4 text-gray-500">
                      {move.type === 'receipt' ? (
                        <span>Vendor <span className="text-gray-400">→</span> {move.destinationLocation?.name}</span>
                      ) : move.type === 'delivery' ? (
                        <span>{move.sourceLocation?.name} <span className="text-gray-400">→</span> Customer</span>
                      ) : move.type === 'adjustment' ? (
                        <span>{move.destinationLocation ? 'Adjustment In' : 'Adjustment Out'}</span>
                      ) : (
                        <span>{move.sourceLocation?.name} <span className="text-gray-400">→</span> {move.destinationLocation?.name}</span>
                      )}
                    </td>
                    <td className="p-4 font-bold">
                      {move.quantity}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold 
                        ${move.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {move.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 flex items-center gap-1">
                      <FaClock className="text-gray-300" />
                      {new Date(move.createdAt).toLocaleDateString()} {new Date(move.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400 italic">
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;