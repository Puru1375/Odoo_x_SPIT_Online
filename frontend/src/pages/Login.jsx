import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Credentials, 2 = OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // Step 1: Submit Email/Pass
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/login', { email, password });
      setStep(2); // Move to OTP input
      alert("OTP sent to your email (Check Console if testing)");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // Step 2: Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      
      // Store Token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Redirect to Dashboard
      navigate('/');
      window.location.reload(); // Quick reload to update Layout state
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">StockMaster Login</h1>
        
        {step === 1 ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input type="email" required className="border w-full p-2 rounded" 
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="mb-6">
              <label className="block mb-1">Password</label>
              <input type="password" required className="border w-full p-2 rounded" 
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="bg-blue-600 text-white w-full py-2 rounded">Send OTP</button>
            <p className="mt-4 text-sm text-center">
              Don't have an account? <Link to="/register" className="text-blue-600">Register</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <label className="block mb-1">Enter OTP sent to {email}</label>
              <input type="text" required className="border w-full p-2 rounded text-center tracking-widest text-xl" 
                maxLength="6"
                value={otp} onChange={e => setOtp(e.target.value)} />
            </div>
            <button className="bg-green-600 text-white w-full py-2 rounded">Verify & Login</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
