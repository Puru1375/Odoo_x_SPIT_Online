import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Save Token & User info (including role)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Setup API header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;



      window.location.href = '/dashboard'; // Force reload to update Layout
      setLoading(false);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input type="email" required className="border w-full p-2 sm:p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input type="password" required className="border w-full p-2 sm:p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button 
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 sm:py-3 rounded hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Loading...' : 'Login'}</button>
          <p className="mt-4 text-sm text-center">
            New User? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;