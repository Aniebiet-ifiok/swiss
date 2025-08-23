import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGlobe, FaLock, FaRocket, FaLeaf, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { supabase } from "../supabase";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const globeVariants = {
    initial: { scale: 0.85, opacity: 0.3 },
    animate: {
      rotate: 360,
      scale: [0.85, 0.9, 0.85],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        rotate: { duration: 40, repeat: Infinity, ease: "linear" },
        scale: { duration: 2.5, repeat: Infinity, repeatType: "reverse" },
        opacity: { duration: 2.5, repeat: Infinity, repeatType: "reverse" },
      },
    },
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          state: formData.state,
          city: formData.city,
        },
      },
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
        password: "",
      });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.2 }}
      >
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-300/30 text-xl"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{
              y: ["0%", "-200%"],
              x: [`${Math.random() * 30 - 15}%`, `${Math.random() * 30 - 15}%`],
              rotate: [0, 360],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{ duration: 10 + Math.random() * 5, repeat: Infinity, repeatType: "loop", delay: i * 0.3 }}
          >
            {React.createElement([FaRocket, FaLeaf, FaLock][Math.floor(Math.random() * 3)])}
          </motion.div>
        ))}
      </motion.div>

      {/* Rotating Globe */}
      <motion.div
        className="absolute top-10 right-10 w-[300px] h-[300px] opacity-40 pointer-events-none"
        variants={globeVariants}
        initial="initial"
        animate="animate"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/83/Earth_Western_Hemisphere.jpg"
          alt="Rotating Globe"
          className="w-full h-full object-cover rounded-full shadow-lg"
          style={{ filter: "drop-shadow(0 0 12px rgba(6, 182, 212, 0.3))" }}
        />
      </motion.div>

      {/* Register Form */}
      <motion.div
        className="bg-gray-800/60 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-2xl border border-cyan-400/15 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-200"
          variants={itemVariants}
        >
          Join the Mission
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter your full name" },
              { label: "Email Address", name: "email", type: "email", placeholder: "Enter your email" },
              { label: "Phone Number", name: "phone", type: "tel", placeholder: "Enter your phone number" },
              { label: "State", name: "state", type: "text", placeholder: "Enter your state" },
              { label: "City", name: "city", type: "text", placeholder: "Enter your city" },
            ].map((field) => (
              <motion.div key={field.name} variants={itemVariants}>
                <label className="block text-gray-200 font-medium mb-2">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                  placeholder={field.placeholder}
                />
              </motion.div>
            ))}

            {/* Password Field with Show/Hide */}
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-gray-200 font-medium mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-14 cursor-pointer right-3 transform -translate-y-1/2 text-gray-400 hover:text-cyan-300"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r cursor-pointer from-cyan-400 to-blue-500 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </motion.div>
        </form>

        <motion.p className="text-gray-200 mt-6 text-center text-sm" variants={itemVariants}>
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-300 cursor-pointer hover:text-cyan-200 underline transition-colors duration-200">
            Login
          </Link>
        </motion.p>
      </motion.div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 10s ease infinite;
        }
      `}</style>
    </div>
  );
}
