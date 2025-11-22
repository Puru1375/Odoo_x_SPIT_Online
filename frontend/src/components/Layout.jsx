import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FaBox, FaChartPie, FaTruck, FaExchangeAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold text-orange-500">StockMaster</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center p-3 hover:bg-gray-700 rounded">
            <FaChartPie className="mr-3" /> Dashboard
          </Link>
          <Link to="/products" className="flex items-center p-3 hover:bg-gray-700 rounded">
            <FaBox className="mr-3" /> Products
          </Link>
          <div className="text-gray-400 text-sm mt-4 mb-2 uppercase px-3">Operations</div>
          <Link to="/receipts" className="flex items-center p-3 hover:bg-gray-700 rounded">
            <FaTruck className="mr-3" /> Receipts (In)
          </Link>
          <Link to="/deliveries" className="flex items-center p-3 hover:bg-gray-700 rounded">
            <FaExchangeAlt className="mr-3" /> Deliveries (Out)
          </Link>
          <Link to="/internal" className="flex items-center p-3 hover:bg-gray-700 rounded">
            <FaExchangeAlt className="mr-3" /> Internal Transfers
          </Link>
          <Link to="/adjustments" className="flex items-center p-3 hover:bg-gray-700 rounded">
            <FaExchangeAlt className="mr-3" /> Inventory Adjustments
          </Link>
        </nav>
        
        {/* Bottom Section - Profile & Settings */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link to="/profile" className="flex items-center p-3 hover:bg-gray-700 rounded">
            <FaUser className="mr-3" /> Profile
          </Link>
          <Link to="/settings" className="flex items-center p-3 hover:bg-gray-700 rounded">
            <FaCog className="mr-3" /> Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-3 hover:bg-gray-700 rounded text-left"
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet /> {/* This renders the current page */}
      </main>
    </div>
  );
};

export default Layout;