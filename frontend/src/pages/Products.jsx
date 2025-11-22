import React, { useEffect, useState } from 'react';
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product List</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          + New Product
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">SKU</th>
              <th className="text-left p-4">Total Stock</th>
              <th className="text-left p-4">Cost</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-4">{p.name}</td>
                <td className="p-4 text-gray-500">{p.sku}</td>
                <td className={`p-4 font-bold ${p.totalStock < p.lowStockThreshold ? 'text-red-500' : 'text-green-600'}`}>
                  {p.totalStock}
                </td>
                <td className="p-4">${p.costPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;