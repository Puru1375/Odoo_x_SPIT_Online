import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input type="text" required className="border w-full p-2 rounded" 
              onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input type="email" required className="border w-full p-2 rounded" 
              onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="mb-6">
            <label className="block mb-1">Password</label>
            <input type="password" required className="border w-full p-2 rounded" 
              onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button className="bg-blue-600 text-white w-full py-2 rounded">Sign Up</button>
          <p className="mt-4 text-sm text-center">
             Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
