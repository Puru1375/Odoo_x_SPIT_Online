import React from 'react';

const Settings = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="mb-6 border-b pb-4">
        <h3 className="text-lg font-semibold mb-2">Application Information</h3>
        <p className="text-gray-600">Version: 1.0.0</p>
        <p className="text-gray-600">Environment: Development</p>
      </div>

      <div className="mb-6 border-b pb-4">
        <h3 className="text-lg font-semibold mb-2">Preferences</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Email Notifications</span>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Danger Zone</h3>
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;
