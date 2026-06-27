import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaWarehouse, FaBoxOpen } from 'react-icons/fa';

const Adjustments = () => {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('physical_count');
  const [physicalCount, setPhysicalCount] = useState('');
  const [manualQty, setManualQty] = useState('');
  const [reason, setReason] = useState('Inventory Count');
  const [message, setMessage] = useState(null);
  const [stockByLocation, setStockByLocation] = useState([]);

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
    api.get('/locations').then(res => setLocations(res.data.filter(l => l.type === 'internal')));
  }, []);

  // Fetch stock by location when product is selected
  useEffect(() => {
    if (selectedProduct) {
      api.get(`/products/${selectedProduct}/stock-by-location`)
        .then(res => setStockByLocation(res.data))
        .catch(() => setStockByLocation([]));
    }
  }, [selectedProduct]);

  const handleAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !selectedLocation) {
      setMessage({ type: 'error', text: 'Please select both product and location' });
      return;
    }

    try {
      let adjustmentQty;
      
      if (adjustmentType === 'physical_count') {
        const currentStock = stockByLocation.find(s => s.locationId === selectedLocation)?.quantity || 0;
        adjustmentQty = parseInt(physicalCount) - currentStock;
      } else {
        adjustmentQty = parseInt(manualQty);
      }

      if (adjustmentQty === 0) {
        setMessage({ type: 'error', text: 'No adjustment needed - stock is already correct' });
        return;
      }

      // Create adjustment move
      const moveData = {
        type: 'adjustment',
        productId: selectedProduct,
        quantity: Math.abs(adjustmentQty),
        sourceLocation: adjustmentQty < 0 ? selectedLocation : null,
        destinationLocation: adjustmentQty > 0 ? selectedLocation : null,
        reference: `ADJ/${new Date().getTime()}`,
        status: 'draft'
      };

      const createResponse = await api.post('/moves', moveData);
      const createdMove = createResponse.data;

      // Immediately validate the move to update stock
      await api.put(`/moves/${createdMove._id}/validate`);
      
      setMessage({ 
        type: 'success', 
        text: `✅ Stock adjusted: ${adjustmentQty > 0 ? '+' : ''}${adjustmentQty} units at ${locations.find(l => l._id === selectedLocation)?.name}` 
      });
      
      // Refresh product list and stock distribution
      const productsRes = await api.get('/products');
      setProducts(productsRes.data);
      
      if (selectedProduct) {
        const stockRes = await api.get(`/products/${selectedProduct}/stock-by-location`);
        setStockByLocation(stockRes.data);
      }
      
      setPhysicalCount('');
      setManualQty('');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to adjust stock' });
    }
  };

  const activeProd = products.find(p => p._id === selectedProduct);
  const selectedLocationStock = stockByLocation.find(s => s.locationId === selectedLocation);

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
        <FaBoxOpen className="mr-2 sm:mr-3 text-purple-600" /> Stock Adjustments
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* LEFT: Adjustment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 sm:p-6 rounded shadow border">
            <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">
              Correct stock levels for specific locations (e.g., damaged items, theft, counting errors)
            </p>

            {message && (
              <div className={`p-2 sm:p-3 mb-4 rounded text-sm sm:text-base ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleAdjustment}>
              
              {/* Product Selection */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Select Product</label>
                <select 
                  className="w-full border p-2 sm:p-3 rounded focus:ring-2 focus:ring-purple-200 text-sm sm:text-base"
                  onChange={e => {
                    setSelectedProduct(e.target.value);
                    setSelectedLocation('');
                  }}
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku}) - Total: {p.totalStock}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Selection */}
              <div className="mb-4">
                <label className="flex items-center text-sm font-bold mb-2">
                  <FaWarehouse className="mr-2 text-gray-400" /> Select Location
                </label>
                <select 
                  className="w-full border p-2 sm:p-3 rounded focus:ring-2 focus:ring-purple-200 text-sm sm:text-base"
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  required
                  disabled={!selectedProduct}
                >
                  <option value="">-- Choose Location --</option>
                  {locations.map(loc => {
                    const stock = stockByLocation.find(s => s.name === loc.name);
                    return (
                      <option key={loc._id} value={loc._id}>
                        {loc.name} (Current: {stock?.quantity || 0})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedProduct && selectedLocation && (
                <div className="mb-4 sm:mb-6 bg-purple-50 p-3 sm:p-4 rounded border border-purple-200">
                  <p className="font-bold text-purple-900 text-sm sm:text-base">Current Stock at {locations.find(l => l._id === selectedLocation)?.name}:</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">{selectedLocationStock?.quantity || 0} {activeProd?.uom}</p>
                </div>
              )}

              {/* Adjustment Type Toggle */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Adjustment Type</label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="adjType" 
                      value="physical_count"
                      checked={adjustmentType === 'physical_count'}
                      onChange={() => setAdjustmentType('physical_count')}
                      className="mr-2"
                    />
                    <span className="text-sm sm:text-base">Physical Count</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="adjType" 
                      value="manual"
                      checked={adjustmentType === 'manual'}
                      onChange={() => setAdjustmentType('manual')}
                      className="mr-2"
                    />
                    <span className="text-sm sm:text-base">Manual +/- Adjustment</span>
                  </label>
                </div>
              </div>

              {/* Input based on type */}
              {adjustmentType === 'physical_count' ? (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Actual Physical Count</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 sm:p-3 rounded font-bold text-base sm:text-lg focus:ring-2 focus:ring-purple-200"
                    placeholder="Enter counted quantity"
                    value={physicalCount}
                    onChange={e => setPhysicalCount(e.target.value)}
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    System will calculate the difference automatically
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Adjustment Quantity</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 sm:p-3 rounded font-bold text-base sm:text-lg focus:ring-2 focus:ring-purple-200"
                    placeholder="e.g., -5 for decrease, +10 for increase"
                    value={manualQty}
                    onChange={e => setManualQty(e.target.value)}
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use negative for decrease, positive for increase
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Reason</label>
                <select 
                  className="w-full border p-2 sm:p-3 rounded text-sm sm:text-base"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                >
                  <option value="Inventory Count">Inventory Count</option>
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Theft/Loss">Theft/Loss</option>
                  <option value="Found Stock">Found Stock</option>
                  <option value="System Error">System Error Correction</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-purple-600 text-white p-2 sm:p-3 rounded hover:bg-purple-700 font-bold transition text-sm sm:text-base"
              >
                Apply Adjustment Now
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Stock Distribution Info */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 sm:p-6 rounded shadow border lg:sticky lg:top-4">
            <h3 className="font-bold mb-4 text-gray-700 text-sm sm:text-base">Stock Distribution</h3>
            
            {selectedProduct ? (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  <strong>{activeProd?.name}</strong>
                </p>
                <p className="text-xl sm:text-2xl font-bold mb-4 text-blue-600">
                  Total: {stockByLocation.reduce((sum, loc) => sum + loc.quantity, 0)} {activeProd?.uom}
                </p>

                <div className="space-y-2">
                  {stockByLocation.length > 0 ? (
                    stockByLocation.map((stock, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs sm:text-sm">
                        <span className="font-medium truncate mr-2">{stock.name}</span>
                        <span className="font-bold text-gray-700 whitespace-nowrap">{stock.quantity}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-400 italic">No stock in any location</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-400 italic">Select a product to view stock distribution</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Adjustments;