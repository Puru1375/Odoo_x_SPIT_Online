import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { FaPrint, FaArrowLeft } from "react-icons/fa";



const Receipts = () => {
  const [allMoves, setAllMoves] = useState([]);
  const [filteredMoves, setFilteredMoves] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Filter State
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
    sourceLocation: "",
    destinationLocation: "",
  });

  // Dropdown Data
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const isManager = user?.role === "Manager";

  const navigate = useNavigate();

  const fetchMoves = () =>
    api.get("/moves?type=receipt").then((res) => {
      setAllMoves(res.data);
      setFilteredMoves(res.data);
    });

  useEffect(() => {
    fetchMoves();
    // Load data for dropdowns
    api.get("/products").then((res) => setProducts(res.data));
    api.get("/locations").then((res) => setLocations(res.data));
  }, []);

  // Apply Filters
  useEffect(() => {
    let filtered = [...allMoves];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((move) => move.status === statusFilter);
    }

    // Search filter (by reference or product name)
    if (searchTerm) {
      filtered = filtered.filter(
        (move) =>
          move.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          move.productId?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMoves(filtered);
  }, [statusFilter, searchTerm, allMoves]);

  // Validate Move Logic
  const handleValidate = async (id) => {
    if (!window.confirm("Validate receipt? Stock will increase.")) return;
    try {
      await api.put(`/moves/${id}/validate`);
      fetchMoves();
    } catch (err) {
      alert("Error");
    }
  };

  // Submit New Receipt
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find Warehouse IDs automatically for better UX
      const vendorLoc = locations.find((l) => l.type === "vendor")?._id;
      const mainWhLoc = locations.find((l) => l.type === "internal")?._id;

      await api.post("/moves", {
        type: "receipt",
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        sourceLocation: vendorLoc, // Auto-select Vendor
        destinationLocation: mainWhLoc, // Auto-select Main Warehouse
      });
      setShowForm(false);
      fetchMoves();
    } catch (err) {
      alert("Failed to create receipt");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Incoming Receipts</h1>
        <button
          onClick={() =>  navigate("/receipts/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Receipt
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded border mb-6">
          <h3 className="font-bold mb-2">Create New Receipt</h3>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm">Product</label>
              <select
                className="border p-2 rounded w-48"
                onChange={(e) =>
                  setFormData({ ...formData, productId: e.target.value })
                }
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Quantity</label>
              <input
                type="number"
                className="border p-2 rounded w-24"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Draft
            </button>
          </form>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white p-4 rounded shadow mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Status</label>
          <select
            className="border p-2 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Search</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Search by reference or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setStatusFilter("all");
              setSearchTerm("");
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-4">Reference</th>
              <th className="text-left p-4">From</th>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">To</th>
              <th className="text-left p-4">Qty</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
              <th>  </th>
            </tr>
          </thead>
          <tbody>
            {filteredMoves.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No receipts found
                </td>
              </tr>
            ) : (
              filteredMoves.map((move) => (
                <tr key={move._id} className="border-b">
                  <td className="p-4 font-mono text-sm">{move.reference}</td>
                  <td className="p-4">{move.sourceLocation?.name}</td>
                  <td className="p-4">{move.productId?.name}</td>
                  <td className="p-4">{move.destinationLocation?.name}</td>
                  <td className="p-4">+{move.quantity}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold 
                      ${move.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {move.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {move.status === "done" ? (
                      <span className="text-sm text-gray-500 italic">
                        No Actions
                      </span>
                    ) : isManager ? (
                      <button
                        onClick={() => handleValidate(move._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Validate
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Awaiting Manager
                      </span>
                    )}
                  </td>
                  <td
                    className="p-4 text-blue-600 cursor-pointer"
                    onClick={() => navigate(`/receipts/${move._id}`)}
                  >
                    View
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Receipts;
