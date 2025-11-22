import React from 'react';
import { FaUserCircle, FaBell } from 'react-icons/fa';

const Header = () => {
  // Get user info from local storage (saved during login)
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest', role: 'Visitor' };

  return (
    <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 z-10">
      {/* Left: Page Title logic can go here, or breadcrumbs */}
      <div className="text-gray-500 text-sm">
        StockMaster IMS &gt; <span className="text-gray-800 font-semibold">Dashboard</span>
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