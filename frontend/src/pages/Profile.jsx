import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '', role: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { 'x-auth-token': token }
      });
      setUser(res.data);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/user/profile', user, {
        headers: { 'x-auth-token': token }
      });
      setUser(res.data);
      setMessage('Profile updated successfully');
      // Update local storage user data if needed
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      {message && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={user.name}
            onChange={(e) => setUser({...user, name: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={user.email}
            onChange={(e) => setUser({...user, email: e.target.value})}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
            value={user.role}
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">Role cannot be changed.</p>
        </div>
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-200"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
