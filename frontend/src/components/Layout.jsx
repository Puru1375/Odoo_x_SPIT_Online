import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaBox, FaChartPie, FaTruck, FaExchangeAlt, FaClipboardList, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Helper for active class
  const getLinkClass = (path) => {
    const base = "flex items-center p-3 rounded mb-1 transition-colors duration-200";
    return location.pathname === path 
      ? `${base} bg-blue-800 text-white shadow-md` 
      : `${base} text-gray-300 hover:bg-gray-800 hover:text-white`;
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-20">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 bg-gray-800 border-b border-gray-700">
          <div className="text-2xl font-bold text-orange-500 tracking-wider">StockMaster</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-gray-500 text-xs font-bold uppercase mb-3 px-3 mt-2">Main</p>
          <Link to="/dashboard" className={getLinkClass('/dashboard')}><FaChartPie className='mr-3'/>Dashboard </Link>
          <Link to="/products" className={getLinkClass('/products')}><FaBox className="mr-3" /> Products</Link>

          <p className="text-gray-500 text-xs font-bold uppercase mb-3 px-3 mt-6">Operations</p>
          <Link to="/receipts" className={getLinkClass('/receipts')}><FaTruck className="mr-3" /> Receipts (In)</Link>
          <Link to="/deliveries" className={getLinkClass('/deliveries')}><FaTruck className="mr-3 transform scale-x-[-1]" /> Deliveries (Out)</Link>
          <Link to="/internal" className={getLinkClass('/internal')}><FaExchangeAlt className="mr-3" /> Internal Transfers</Link>
          <Link to="/adjustments" className={getLinkClass('/adjustments')}><FaClipboardList className="mr-3" /> Adjustments</Link>

          <p className="text-gray-500 text-xs font-bold uppercase mb-3 px-3 mt-6">System</p>
          <Link to="/settings" className={getLinkClass('/settings')}><FaCog className="mr-3" /> Settings</Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300 w-full p-2 transition">
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* --- RIGHT CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-100 relative">
          <Outlet />
        </main>

        {/* Bottom Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;