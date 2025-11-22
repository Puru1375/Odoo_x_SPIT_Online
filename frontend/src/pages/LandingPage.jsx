import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaChartLine, FaSync, FaUserShield, FaArrowRight, FaCheck } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <FaBoxOpen /> StockMaster
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition">
              Log In
            </Link>
            <Link to="/register" className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold tracking-wide mb-2">
              🚀 Hackathon Ready IMS
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
              Stop using Excel. <br/>
              <span className="text-blue-600">Start Mastering Stock.</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Replace scattered tracking methods with a centralized, real-time Double-Entry Inventory System. Designed for Managers and Warehouse Staff.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                Start Free Trial <FaArrowRight />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 text-lg font-bold rounded-lg hover:bg-gray-50 transition flex items-center justify-center">
                Live Demo
              </Link>
            </div>

            <div className="pt-6 flex gap-8 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-2"><FaCheck className="text-green-500" /> Real-time Sync</span>
              <span className="flex items-center gap-2"><FaCheck className="text-green-500" /> Multi-Location</span>
              <span className="flex items-center gap-2"><FaCheck className="text-green-500" /> Audit Ledger</span>
            </div>
          </div>

          {/* Right Visual (Abstract Dashboard) */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl blur opacity-20 animate-pulse"></div>
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden p-2">
                {/* Mockup Header */}
                <div className="h-8 bg-gray-50 border-b flex items-center px-4 gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                {/* Mockup Body */}
                <div className="space-y-4 p-4">
                    <div className="flex justify-between">
                        <div className="h-24 w-1/3 bg-blue-50 rounded-lg border border-blue-100 flex flex-col justify-center items-center">
                            <span className="text-3xl font-bold text-blue-600">1,240</span>
                            <span className="text-xs text-gray-500">Total Products</span>
                        </div>
                        <div className="h-24 w-1/3 mx-4 bg-orange-50 rounded-lg border border-orange-100 flex flex-col justify-center items-center">
                            <span className="text-3xl font-bold text-orange-600">12</span>
                            <span className="text-xs text-gray-500">Pending Orders</span>
                        </div>
                        <div className="h-24 w-1/3 bg-red-50 rounded-lg border border-red-100 flex flex-col justify-center items-center">
                            <span className="text-3xl font-bold text-red-600">5</span>
                            <span className="text-xs text-gray-500">Low Stock</span>
                        </div>
                    </div>
                    <div className="h-40 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        Real-time Stock Ledger Visualization
                    </div>
                </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- PROBLEM STATEMENT SECTION --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why StockMaster?</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              The goal is to replace manual registers and Excel sheets with a modular Inventory Management System.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FaSync className="text-blue-500" />}
              title="Double-Entry Inventory"
              desc="Every move is traced. From Vendor to Stock to Customer. Nothing gets lost."
            />
            <FeatureCard 
              icon={<FaChartLine className="text-purple-500" />}
              title="Real-Time Reporting"
              desc="View Total Products, Low Stock alerts, and Pending Receipts instantly."
            />
            <FeatureCard 
              icon={<FaUserShield className="text-orange-500" />}
              title="Role-Based Access"
              desc="Managers validate moves. Staff perform pickings. Secure and organized."
            />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Timeline) --- */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Streamlined Workflow</h2>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            
            <TimelineItem 
              step="1"
              title="Receipts (Incoming)"
              desc="Create a receipt when items arrive from vendors. Validate to increase stock."
            />
            <TimelineItem 
              step="2"
              title="Internal Transfers"
              desc="Move stock between warehouses or racks (e.g., Main Store → Production Floor)."
            />
            <TimelineItem 
              step="3"
              title="Delivery Orders"
              desc="Pick, Pack, and Ship. Validating decreases stock automatically."
            />
          </div>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to optimize your inventory?</h2>
          <Link to="/register" className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
            Get Started Now
          </Link>
          <p className="mt-8 text-gray-500 text-sm">
            © {new Date().getFullYear()} StockMaster. Built for Hackathon.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Sub-components for cleaner code
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const TimelineItem = ({ step, title, desc }) => (
  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
      {step}
    </div>
    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  </div>
);

export default LandingPage;