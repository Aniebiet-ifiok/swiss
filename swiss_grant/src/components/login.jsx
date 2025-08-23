import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGlobe, FaLock, FaRocket, FaLeaf, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { supabase } from "../supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (error) return toast.error(error.message);

    if (!data.user.has_paid) {
      toast("Please complete the gas fee payment to access the dashboard.");
      navigate("/ceo_dashboard", { state: { userId: data.user.id } });
    } else {
      toast.success("Logged in successfully!");
      navigate("/ceo_dashboard");
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

      {/* Login Form */}
      <motion.div
        className="bg-gray-800/60 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md border border-cyan-400/15 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-200"
          variants={itemVariants}
        >
          Welcome Back
        </motion.h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants}>
            <label className="block text-gray-200 font-medium mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
              placeholder="Enter your email"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <label className="block text-gray-200 font-medium mb-2">Password</label>
            <input
              type={showPassword ? "text" : "password"} // Toggle type
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-14 cursor-pointer right-3 transform -translate-y-1/2 text-gray-400 hover:text-cyan-300"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r cursor-pointer from-cyan-400 to-blue-500 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </motion.div>
        </form>

        <motion.p className="text-gray-200 mt-6 text-center text-sm" variants={itemVariants}>
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-cyan-300 cursor-pointer hover:text-cyan-200 underline transition-colors duration-200"
          >
            Register
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
