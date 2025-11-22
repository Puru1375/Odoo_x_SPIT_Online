import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaUserCircle, FaBell } from 'react-icons/fa';

const Header = () => {
  // Get user info from local storage (saved during login)
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest', role: 'Visitor' };
  const location = useLocation();

  // Map routes to page names
  const pageNames = {
    '/dashboard': 'Dashboard',
    '/products': 'Product Management',
    '/products/new': 'Create New Product',
    '/products/:id': 'Product Details',
    '/products/:id/edit': 'Edit Product',
    '/receipts': 'Incoming Receipts',
    '/receipts/new': 'New Receipt',
    '/receipts/:id': 'Receipt Details',
    '/deliveries': 'Outgoing Deliveries',
    '/deliveries/new': 'New Delivery Order',
    '/deliveries/:id': 'Delivery Details',
    '/internal': 'Internal Transfers',
    '/adjustment': 'Inventory Adjustments',
    '/adjustments': 'Adjustment History',
    '/locations': 'Locations',
    '/profile': 'My Profile',
    '/settings': 'Settings',
  };

  // Get current page name
  const getCurrentPageName = () => {
    const path = location.pathname;
    
    // Check exact match first
    if (pageNames[path]) return pageNames[path];
    
    // Check pattern matches (e.g., /products/123 -> Product Details)
    if (path.match(/^\/products\/[a-zA-Z0-9]+$/)) return pageNames['/products/:id'];
    if (path.match(/^\/products\/[a-zA-Z0-9]+\/edit$/)) return pageNames['/products/:id/edit'];
    if (path.match(/^\/receipts\/[a-zA-Z0-9]+$/)) return pageNames['/receipts/:id'];
    if (path.match(/^\/deliveries\/[a-zA-Z0-9]+$/)) return pageNames['/deliveries/:id'];
    
    // Default
    return 'Page';
  };

  const currentPageName = getCurrentPageName();

  return (
    <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 z-10">
      {/* Left: Page Title */}
      <div className="text-gray-500 text-sm">
        StockMaster &gt; <span className="text-gray-800 font-semibold">
            {currentPageName}
        </span>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <button className="relative text-gray-500 hover:text-blue-600">
          <FaBell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 border-l pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500 uppercase">{user.role}</p>
          </div>
          <FaUserCircle size={32} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;