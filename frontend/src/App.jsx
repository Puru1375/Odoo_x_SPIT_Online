import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
// import Deliveries from './pages/Deliveries'; // (Create this similarly to Receipts)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="deliveries" element={<div>Deliveries Page (WIP)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;