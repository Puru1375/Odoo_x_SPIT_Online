import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // Import this
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import InternalTransfers from './pages/InternalTransfers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import InventoryAdjustments from './pages/InventoryAdjustments';
import Adjustments from './pages/Adjustments';
import Locations from './pages/Locations';
import ProductDetail from './pages/ProductDetail';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="adjustment" element={<InventoryAdjustments />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="internal" element={<InternalTransfers />} />
            <Route path="adjustments" element={<Adjustments />} />
            <Route path="locations" element={<Locations />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;