import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      // In a real app, this would be a multi-step process (Request OTP -> Verify OTP -> Reset Password)
      // For this MVP, we are just resetting it directly with the email.
      await axios.post('http://localhost:5000/api/auth/reset-password', { email, newPassword });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">Reset Password</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded text-sm">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 sm:p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
            <input
              type="password"
              className="w-full p-2 sm:p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white p-2 sm:p-3 rounded hover:bg-orange-600 transition duration-200 font-medium"
          >
            Reset Password
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
