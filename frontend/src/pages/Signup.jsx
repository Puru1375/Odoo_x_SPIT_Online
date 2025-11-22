import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'Staff' // Default role
  });
  const [otp, setOtp] = useState('');

  // Step 1: Send OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      setStep(2);
      setLoading(false);
      alert("OTP sent to email!");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  // Step 2: Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-registration', { email: formData.email, otp });
      alert("Verification Successful! Please Login.");
      setLoading(false);
      navigate('/login');
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {step === 1 ? 'Create Account' : 'Verify Email'}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block mb-1 text-sm">Name</label>
              <input type="text" required className="border w-full p-2 rounded"
                onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm">Email</label>
              <input type="email" required className="border w-full p-2 rounded"
                onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm">Password</label>
              <input type="password" required className="border w-full p-2 rounded"
                onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="mb-6">
              <label className="block mb-1 text-sm">Role</label>
              <select className="border w-full p-2 rounded"
                onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="Staff">Staff (Create Only)</option>
                <option value="Manager">Manager (Full Access)</option>
              </select>
            </div>
            <button 
            disabled={loading}
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
              {loading ? 'Sending Otp...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
             <p className="mb-4 text-sm text-gray-600">Enter the code sent to {formData.email}</p>
            <input type="text" required className="border w-full p-2 rounded text-center tracking-widest text-xl mb-6"
              maxLength="6" value={otp} onChange={e => setOtp(e.target.value)} />
            <button 
            disabled={loading}
            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700">
              {loading ? 'Verifying...' : 'Verify & Complete Registration'}
            </button>
          </form>
        )}
        
        {step === 1 && (
           <p className="mt-4 text-sm text-center">
             Already verified? <Link to="/login" className="text-blue-600">Login</Link>
           </p>
        )}
      </div>
    </div>
  );
};

export default Register;