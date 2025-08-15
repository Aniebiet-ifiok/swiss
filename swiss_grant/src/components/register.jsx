import React, { useState } from "react";
import { supabase } from "../supabase";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Supabase signup
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          state: formData.state,
          city: formData.city
        }
      }
    });

    setLoading(false);

    if (error) {
      toast.error(error.message, { duration: 5000 });
    } else {
      toast.success("Registration successful! Check your email to confirm.", {
        duration: 5000,
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        state: "",
        city: "",
        password: ""
      });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-300">
      <motion.div
        className="bg-white/30 backdrop-blur-md p-10 rounded-xl shadow-lg w-full max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", name: "fullName", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone Number", name: "phone", type: "text" },
            { label: "State", name: "state", type: "text" },
            { label: "City", name: "city", type: "text" },
            { label: "Password", name: "password", type: "password" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-white font-medium mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-white mt-4 text-center">
          Already have an account? <Link to="/login" className="underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
