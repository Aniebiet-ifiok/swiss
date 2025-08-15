// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Dummy credentials
  const DUMMY_ADMIN = {
    email: "admin@swissgrant.com",
    password: "Admin123!",
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === DUMMY_ADMIN.email && password === DUMMY_ADMIN.password) {
      toast.success("Login successful!");
      navigate("/admin_dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        <label className="block mb-2">Email</label>
        <input
          type="email"
          className="w-full p-2 rounded mb-4 bg-gray-700 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          className="w-full p-2 rounded mb-6 bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-600 p-3 rounded hover:bg-green-700 font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}
