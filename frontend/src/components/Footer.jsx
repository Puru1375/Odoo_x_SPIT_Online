import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t h-12 flex items-center justify-center text-xs text-gray-500">
      <p>&copy; {new Date().getFullYear()} StockMaster IMS. All rights reserved. Hackathon Build v1.0</p>
    </footer>
  );
};

export default Footer;