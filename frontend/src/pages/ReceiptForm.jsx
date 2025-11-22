import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaPrint, FaArrowLeft } from 'react-icons/fa';

const ReceiptForm = () => {
  const { id } = useParams(); // If ID exists, we are viewing. If not, creating.
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // State
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isNew, setIsNew] = useState(!id);
  
  const [formData, setFormData] = useState({
    reference: 'New',
    sourceLocation: '',
    destinationLocation: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    responsibleName: user?.name || '',
    productId: '',
    quantity: 1,
    status: 'draft'
  });

  // Load Data
  useEffect(() => {
    // Load Dropdowns
    api.get('/products').then(res => setProducts(res.data));
    api.get('/locations').then(res => setLocations(res.data));

    // If Editing/Viewing, Load Document
    if (!isNew) {
      api.get(`/moves?id=${id}`).then(res => {
        // Note: In a real app, you'd fetch by ID directly. 
        // Here filtering the list for hackathon speed if needed, or assume backend supports GET /:id
        const doc = res.data.find(m => m._id === id); 
        if(doc) {
          setFormData({
            ...doc,
            sourceLocation: doc.sourceLocation._id,
            destinationLocation: doc.destinationLocation._id,
            productId: doc.productId._id,
            responsibleName: doc.responsible?.name || user.name,
            scheduledDate: doc.scheduledDate.split('T')[0]
          });
        }
      });
    } else {
        // Auto-set Destination to Main Warehouse for Receipts
        api.get('/locations').then(res => {
            const main = res.data.find(l => l.type === 'internal');
            if(main) setFormData(prev => ({...prev, destinationLocation: main._id}));
        });
    }
  }, [id, isNew]);

  // --- ACTIONS ---

  const handleSave = async () => {
    if(!formData.productId || !formData.sourceLocation || !formData.quantity) {
        return alert("Please fill all required fields");
    }
    try {
      const payload = {
        type: 'receipt',
        productId: formData.productId,
        quantity: formData.quantity,
        sourceLocation: formData.sourceLocation,
        destinationLocation: formData.destinationLocation,
        scheduledDate: formData.scheduledDate
      };
      
      const res = await api.post('/moves', payload);
      alert("Receipt Created!");
      navigate('/receipts'); // Switch to View Mode
    } catch (err) { alert("Error saving"); }
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/moves/${id}/status`, { status: newStatus });
      setFormData(prev => ({ ...prev, status: newStatus }));
    } catch (err) { alert("Error updating status"); }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- STATUS BAR COMPONENT ---
  const StatusBar = () => {
    const steps = ['draft', 'ready', 'done'];
    return (
        <div className="flex border rounded-r overflow-hidden">
            {steps.map((step) => (
                <div key={step} 
                     className={`px-4 py-2 text-sm font-bold uppercase border-l 
                     ${formData.status === step ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}>
                    {step}
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Top Nav */}
      <div className="flex justify-between items-center mb-4 no-print">
        <button onClick={() => navigate('/receipts')} className="text-gray-500 flex items-center hover:text-gray-800">
            <FaArrowLeft className="mr-2"/> Back to Receipts
        </button>
        <div className="text-gray-400 text-sm">StockMaster / Receipts / {formData.reference}</div>
      </div>

      {/* --- CONTROL PANEL (Action Bar) --- */}
      <div className="bg-white border rounded-t-lg p-3 flex justify-between items-center shadow-sm">
        
        {/* LEFT: Action Buttons */}
        <div className="flex gap-2">
            {/* 1. EDIT MODE (New) */}
            {isNew && (
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                    Save
                </button>
            )}

            {/* 2. DRAFT -> READY (Mark as Todo) */}
            {!isNew && formData.status === 'draft' && (
                <button onClick={() => updateStatus('ready')} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                    Mark as Todo
                </button>
            )}

            {/* 3. READY -> DONE (Validate) */}
            {!isNew && formData.status === 'ready' && (
                <button onClick={() => updateStatus('done')} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
                    Validate
                </button>
            )}

            {/* 4. PRINT (Only when Done) */}
            {!isNew && formData.status === 'done' && (
                <button onClick={handlePrint} className="border border-gray-300 text-gray-700 px-4 py-1 rounded hover:bg-gray-50 flex items-center">
                    <FaPrint className="mr-2"/> Print
                </button>
            )}

            {/* CANCEL */}
            {!isNew && formData.status !== 'done' && (
                 <button onClick={() => updateStatus('cancelled')} className="text-red-500 px-4 py-1 rounded hover:bg-red-50">
                    Cancel
                </button>
            )}
        </div>

        {/* RIGHT: Status Bar */}
        <StatusBar />
      </div>

      {/* --- DOCUMENT BODY --- */}
      <div className="bg-white border-x border-b rounded-b-lg p-8 shadow-sm printable-area">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{formData.reference}</h1>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8">
            
            {/* Left Column */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">Receive From</label>
                    <select 
                        disabled={!isNew}
                        className="w-full border-b-2 border-gray-200 py-2 focus:outline-none focus:border-blue-500 bg-transparent"
                        value={formData.sourceLocation}
                        onChange={e => setFormData({...formData, sourceLocation: e.target.value})}
                    >
                        <option value="">Select Vendor...</option>
                        {locations.filter(l => l.type === 'vendor').map(l => (
                            <option key={l._id} value={l._id}>{l.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                     <label className="block text-sm font-bold text-gray-700">Responsible</label>
                     <input 
                        disabled
                        className="w-full border-b-2 border-gray-200 py-2 bg-transparent text-gray-600"
                        value={formData.responsibleName}
                     />
                     <span className="text-xs text-gray-400">Auto-filled with current user</span>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">Scheduled Date</label>
                    <input 
                        type="date"
                        disabled={!isNew}
                        className="w-full border-b-2 border-gray-200 py-2 focus:outline-none focus:border-blue-500 bg-transparent"
                        value={formData.scheduledDate}
                        onChange={e => setFormData({...formData, scheduledDate: e.target.value})}
                    />
                </div>
                
                {/* Destination (Hidden mostly, but good for reference) */}
                <div>
                    <label className="block text-sm font-bold text-gray-700">Destination</label>
                    <div className="py-2 text-gray-600">Main Warehouse</div>
                </div>
            </div>
        </div>

        {/* Products Tabs/Lines */}
        <div className="mt-8">
            <div className="border-b border-gray-300 mb-4">
                <span className="inline-block border-b-2 border-blue-600 pb-2 text-blue-600 font-bold">Operations</span>
            </div>

            <table className="min-w-full text-left">
                <thead>
                    <tr className="text-gray-500 text-sm border-b">
                        <th className="pb-3">Product</th>
                        <th className="pb-3">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-4">
                             <select 
                                disabled={!isNew}
                                className="w-full p-2 border rounded bg-gray-50"
                                value={formData.productId}
                                onChange={e => setFormData({...formData, productId: e.target.value})}
                            >
                                <option value="">Add a Product...</option>
                                {products.map(p => <option key={p._id} value={p._id}>{p.name} [{p.sku}]</option>)}
                            </select>
                        </td>
                        <td className="py-4">
                            <input 
                                type="number"
                                disabled={!isNew}
                                className="w-24 p-2 border rounded bg-gray-50 text-right"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: e.target.value})}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};

export default ReceiptForm;