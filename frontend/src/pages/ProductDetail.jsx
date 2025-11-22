import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { FaArrowLeft, FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams(); // Get ID from URL
  const [product, setProduct] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // 1. Fetch Basic Info
    api.get('/products').then(res => {
      const p = res.data.find(item => item._id === id);
      setProduct(p);
    });

    // 2. Fetch Stock Per Location (The new endpoint)
    api.get(`/products/${id}/stock-by-location`).then(res => {
      setLocations(res.data);
    });
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/products" className="text-gray-500 hover:text-gray-800 flex items-center mb-4">
        <FaArrowLeft className="mr-2" /> Back to Products
      </Link>

      {/* Header Card */}
      <div className="bg-white p-6 rounded shadow mb-6 border-l-4 border-blue-600">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-gray-500 font-mono mt-1">SKU: {product.sku}</p>
            <div className="mt-2 flex gap-2">
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{product.category}</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">UoM: {product.uom}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Stock</p>
            <p className="text-4xl font-bold text-blue-600">{product.totalStock}</p>
          </div>
        </div>

        {/* Reordering Rule Visual */}
        {product.totalStock <= product.lowStockThreshold && (
          <div className="mt-4 bg-red-100 text-red-800 p-3 rounded flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <strong>Low Stock Alert:</strong> Current stock is below the reorder rule of {product.lowStockThreshold}.
          </div>
        )}
      </div>

      {/* Stock Availability Per Location */}
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaBoxOpen className="mr-2" /> Stock Availability per Location
      </h2>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Location / Warehouse</th>
              <th className="p-4 text-left">Quantity On Hand</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {locations.length > 0 ? locations.map((loc, index) => (
              <tr key={index} className="border-b">
                <td className="p-4 font-medium">{loc.name}</td>
                <td className="p-4 font-bold">{loc.quantity} {product.uom}</td>
                <td className="p-4">
                  {loc.quantity > 0 ? (
                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">In Stock</span>
                  ) : (
                     <span className="text-gray-400">Empty</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-500">
                  No stock found in any internal locations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductDetail;