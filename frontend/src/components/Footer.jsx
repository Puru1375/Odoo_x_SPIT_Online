import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t h-12 flex items-center justify-center text-[10px] sm:text-xs text-gray-500 px-2 text-center">
      <p>&copy; {new Date().getFullYear()} StockMaster IMS. All rights reserved. <span className="hidden sm:inline">Hackathon Build v1.0</span></p>
    </footer>
  );
};

export default Footer;