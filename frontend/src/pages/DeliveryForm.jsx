import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaPrint, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';

const DeliveryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isNew, setIsNew] = useState(!id);
  
  const [formData, setFormData] = useState({
    reference: 'New',
    sourceLocation: '',      // Main Warehouse
    destinationLocation: '', // Customer Address
    scheduledDate: new Date().toISOString().split('T')[0],
    responsibleName: user?.name || '',
    productId: '',
    quantity: 0,
    status: 'draft'
  });

  // Load Data
  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
    api.get('/locations').then(res => {
      setLocations(res.data);
      // If New, Auto-set Source to Main Warehouse
      if (isNew) {
        const main = res.data.find(l => l.type === 'internal');
        if (main) setFormData(prev => ({ ...prev, sourceLocation: main._id }));
      }
    });

    if (!isNew) {
      api.get('/moves').then(res => {
        const doc = res.data.find(m => m._id === id);
        if (doc) {
          setFormData({
            ...doc,
            sourceLocation: doc.sourceLocation?._id,
            destinationLocation: doc.destinationLocation?._id,
            productId: doc.productId?._id,
            responsibleName: doc.responsible?.name || 'Unknown',
            scheduledDate: doc.scheduledDate.split('T')[0]
          });
        }
      });
    }
  }, [id, isNew]);

  // --- LOGIC: CHECK AVAILABILITY ---
  const getSelectedProductStock = () => {
    const prod = products.find(p => p._id === formData.productId);
    return prod ? prod.totalStock : 0;
  };

  const isOutOfStock = () => {
    const stock = getSelectedProductStock();
    return parseInt(formData.quantity) > stock;
  };

  // --- ACTIONS ---
  const handleSave = async () => {
    if(!formData.productId || !formData.sourceLocation || !formData.quantity) {
        return alert("Please fill in all required fields.");
    }
    try {
      const res = await api.post('/moves', { ...formData, type: 'delivery' });
      alert("Delivery Created!");
      navigate('/deliveries');
    } catch (err) { alert("Error saving"); }
  };

  const handleCheckAvailability = async () => {
    // Logic: If stock is enough -> Ready. If not -> Waiting.
    const newStatus = isOutOfStock() ? 'waiting' : 'ready';
    
    try {
      await api.put(`/moves/${id}/status`, { status: newStatus });
      setFormData(prev => ({ ...prev, status: newStatus }));
      if(newStatus === 'waiting') alert("Warning: Not enough stock. Status set to Waiting.");
    } catch (err) { alert("Error updating status"); }
  };

  const handleValidate = async () => {
    if(isOutOfStock()) {
        alert("Cannot validate: Insufficient Stock!");
        return;
    }
    try {
      await api.put(`/moves/${id}/status`, { status: 'done' });
      setFormData(prev => ({ ...prev, status: 'done' }));
    } catch (err) { alert("Error validating"); }
  };

  // --- STATUS BAR ---
  const StatusBar = () => {
    // Wireframe steps: Draft > Waiting > Ready > Done
    const steps = ['draft', 'waiting', 'ready', 'done'];
    return (
        <div className="flex border rounded-r overflow-hidden">
            {steps.map((step) => (
                <div key={step} className={`px-4 py-2 text-sm font-bold uppercase border-l 
                    ${formData.status === step ? 'bg-orange-600 text-white' : 'bg-white text-gray-500'}`}>
                    {step}
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4 no-print">
        <button onClick={() => navigate('/deliveries')} className="text-gray-500 flex items-center hover:text-gray-800">
            <FaArrowLeft className="mr-2"/> Back to Deliveries
        </button>
        <div className="text-gray-400 text-sm">StockMaster / Deliveries / {formData.reference}</div>
      </div>

      {/* --- ACTION BAR --- */}
      <div className="bg-white border rounded-t-lg p-3 flex justify-between items-center shadow-sm">
        <div className="flex gap-2">
            {isNew && (
                <button onClick={handleSave} className="bg-gray-800 text-white px-4 py-1 rounded">Save</button>
            )}

            {/* CHECK AVAILABILITY Button (Moves from Draft -> Ready/Waiting) */}
            {!isNew && (formData.status === 'draft' || formData.status === 'waiting') && (
                <button onClick={handleCheckAvailability} className="bg-orange-600 text-white px-4 py-1 rounded hover:bg-orange-700">
                    Check Availability
                </button>
            )}

            {/* VALIDATE Button (Moves from Ready -> Done) */}
            {!isNew && formData.status === 'ready' && (
                <button onClick={handleValidate} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
                    Validate
                </button>
            )}

            {!isNew && formData.status === 'done' && (
                <button onClick={() => window.print()} className="border border-gray-300 text-gray-700 px-4 py-1 rounded flex items-center">
                    <FaPrint className="mr-2"/> Print
                </button>
            )}

            {!isNew && formData.status !== 'done' && (
                 <button onClick={() => updateStatus('cancelled')} className="text-red-500 px-4 py-1 rounded">Cancel</button>
            )}
        </div>
        <StatusBar />
      </div>

      {/* --- DOCUMENT BODY --- */}
      <div className="bg-white border-x border-b rounded-b-lg p-8 shadow-sm printable-area">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{formData.reference}</h1>

        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">Delivery Address (Customer)</label>
                    <select 
                        disabled={!isNew}
                        className="w-full border-b-2 border-gray-200 py-2 focus:outline-none focus:border-orange-500 bg-transparent"
                        value={formData.destinationLocation}
                        onChange={e => setFormData({...formData, destinationLocation: e.target.value})}
                    >
                        <option value="">Select Customer...</option>
                        {locations.filter(l => l.type === 'customer').map(l => (
                            <option key={l._id} value={l._id}>{l.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-bold text-gray-700">Responsible</label>
                     <input disabled className="w-full border-b-2 border-gray-200 py-2 bg-transparent text-gray-600"
                        value={formData.responsibleName} />
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">Schedule Date</label>
                    <input type="date" disabled={!isNew}
                        className="w-full border-b-2 border-gray-200 py-2 focus:outline-none focus:border-orange-500 bg-transparent"
                        value={formData.scheduledDate}
                        onChange={e => setFormData({...formData, scheduledDate: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">Operation Type</label>
                    <div className="py-2 text-gray-600">Delivery Order</div>
                </div>
            </div>
        </div>

        {/* --- PRODUCTS LINE (The Red Alert Logic) --- */}
        <div className="mt-8">
            <div className="border-b border-gray-300 mb-4">
                <span className="inline-block border-b-2 border-orange-600 pb-2 text-orange-600 font-bold">Products</span>
            </div>

            <table className="min-w-full text-left">
                <thead>
                    <tr className="text-gray-500 text-sm border-b">
                        <th className="pb-3">Product</th>
                        <th className="pb-3 text-right">Demand</th>
                        <th className="pb-3 text-right">Available</th>
                    </tr>
                </thead>
                <tbody>
                    {/* THE ROW */}
                    <tr className={`${isOutOfStock() ? 'bg-red-50' : ''}`}>
                        <td className="py-4 relative">
                            <select 
                                disabled={!isNew}
                                className={`w-full p-2 border rounded ${isOutOfStock() ? 'text-red-700 border-red-300' : 'bg-gray-50'}`}
                                value={formData.productId}
                                onChange={e => setFormData({...formData, productId: e.target.value})}
                            >
                                <option value="">Add a Product...</option>
                                {products.map(p => <option key={p._id} value={p._id}>{p.name} [{p.sku}]</option>)}
                            </select>
                            
                            {/* The Notification Alert from Wireframe */}
                            {isOutOfStock() && (
                                <div className="absolute left-0 -top-2 flex items-center text-xs text-red-600 font-bold">
                                    <FaExclamationCircle className="mr-1"/> Not in stock
                                </div>
                            )}
                        </td>
                        
                        <td className="py-4 text-right">
                            <input 
                                type="number" disabled={!isNew}
                                className={`w-24 p-2 border rounded text-right ${isOutOfStock() ? 'text-red-700 border-red-300 bg-red-50 font-bold' : 'bg-gray-50'}`}
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: e.target.value})}
                            />
                        </td>

                        <td className="py-4 text-right">
                           <span className={`px-2 py-1 rounded text-sm ${isOutOfStock() ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                {getSelectedProductStock()} Units
                           </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};

export default DeliveryForm;