import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaArrowLeft } from 'react-icons/fa';

const ProductForm = () => {
  const { id } = useParams(); // If ID exists, we are editing. If not, creating.
  const navigate = useNavigate();
  const isNew = !id;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    uom: 'Units',
    costPrice: '',
    lowStockThreshold: 10,
    initialStock: ''
  });

  const [loading, setLoading] = useState(false);

  // Load Product Data if Editing
  useEffect(() => {
    if (!isNew) {
      setLoading(true);
      api.get('/products')
        .then(res => {
          const product = res.data.find(p => p._id === id);
          if (product) {
            setFormData({
              name: product.name,
              sku: product.sku,
              category: product.category,
              uom: product.uom,
              costPrice: product.costPrice || '',
              lowStockThreshold: product.lowStockThreshold,
              initialStock: '' // Cannot edit initial stock
            });
          } else {
            alert('Product not found');
            navigate('/products');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading product:', err);
          alert('Error loading product');
          navigate('/products');
        });
    }
  }, [id, isNew, navigate]);

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.category) {
      return alert('Please fill all required fields');
    }

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        uom: formData.uom,
        costPrice: formData.costPrice,
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        ...(isNew && formData.initialStock && { initialStock: parseInt(formData.initialStock) })
      };

      if (isNew) {
        await api.post('/products', payload);
        alert('Product Created Successfully!');
      } else {
        await api.put(`/products/${id}`, payload);
        alert('Product Updated Successfully!');
      }
      navigate('/products');
    } catch (err) {
      alert('Error saving product: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Top Nav */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/products')} 
          className="text-gray-500 flex items-center hover:text-gray-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Products
        </button>
        <h1 className="text-2xl font-bold">
          {isNew ? 'Create New Product' : 'Edit Product'}
        </h1>
        <div />
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            
            {/* Product Name */}
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                SKU / Code <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                list="cat-list"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                required
              />
              <datalist id="cat-list">
                <option value="Raw Materials" />
                <option value="Finished Goods" />
                <option value="Consumables" />
              </datalist>
            </div>

            {/* Unit of Measure */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Unit of Measure</label>
              <select 
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.uom}
                onChange={e => setFormData({...formData, uom: e.target.value})}
              >
                <option value="Units">Units</option>
                <option value="kg">kg</option>
                <option value="m">meters</option>
                <option value="L">Liters</option>
              </select>
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Cost Price (₹)</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.costPrice}
                onChange={e => setFormData({...formData, costPrice: e.target.value})}
              />
            </div>

            {/* Reorder Rule (Min) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reorder Rule (Min) <span className="text-red-500">*</span>
              </label>
              <input 
                type="number"
                min="0"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.lowStockThreshold}
                onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})}
                required
              />
            </div>

            {/* Initial Stock (Only for New Products) */}
            {isNew && (
              <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-bold text-blue-700 mb-2">
                  Initial Stock (Optional)
                </label>
                <input 
                  type="number"
                  min="0"
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter initial quantity (leave blank for 0)"
                  value={formData.initialStock}
                  onChange={e => setFormData({...formData, initialStock: e.target.value})}
                />
                <p className="text-xs text-gray-600 mt-1">This value will be recorded when the product is created.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button 
              type="button"
              onClick={() => navigate('/products')}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isNew ? 'Create Product' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
