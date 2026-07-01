import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaBox, FaChartPie, FaTruck, FaExchangeAlt, FaClipboardList, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-3 rounded shadow-lg"
      >
        {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className={`
        w-64 bg-gray-900 text-white flex flex-col shadow-xl z-40
        fixed lg:static h-full
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 bg-gray-800 border-b border-gray-700">
          <div className="text-2xl font-bold text-orange-500 tracking-wider">StockMaster</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-gray-500 text-xs font-bold uppercase mb-3 px-3 mt-2">Main</p>
          <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/dashboard')}><FaChartPie className='mr-3'/>Dashboard </Link>
          <Link to="/products" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/products')}><FaBox className="mr-3" /> Products</Link>

          <p className="text-gray-500 text-xs font-bold uppercase mb-3 px-3 mt-6">Operations</p>
          <Link to="/receipts" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/receipts')}><FaTruck className="mr-3" /> Receipts (In)</Link>
          <Link to="/deliveries" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/deliveries')}><FaTruck className="mr-3 transform scale-x-[-1]" /> Deliveries (Out)</Link>
          <Link to="/internal" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/internal')}><FaExchangeAlt className="mr-3" /> Internal Transfers</Link>
          <Link to="/adjustments" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/adjustments')}><FaClipboardList className="mr-3" /> Adjustments</Link>

          <p className="text-gray-500 text-xs font-bold uppercase mb-3 px-3 mt-6">System</p>
          <Link to="/settings" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/settings')}><FaCog className="mr-3" /> Settings</Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300 w-full p-2 transition">
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* --- RIGHT CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Header */}
        <Header />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-100 relative">
          <Outlet />
        </main>

        {/* Bottom Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;