import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket, FaBitcoin, FaMoneyBillWave, FaLock, FaGlobe, FaLeaf } from "react-icons/fa";
import favicon from '../assets/favicon.png';
import  { supabase } from '../supabase'



export default function LandingPage() {
  const [disbursementDate, setDisbursementDate] = useState(null);

   const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // ✅ Fetch disbursement date from Supabase
  useEffect(() => {
    const fetchDisbursementDate = async () => {
      const { data, error } = await supabase
        .from("settings") // replace with your table
        .select("disbursement_date")
        .order("disbursement_date", { ascending: true });

      if (error) {
        console.error("Error fetching disbursement date:", error);
        return;
      }

      if (data && data.length > 0) {
        // pick the first future date
        const now = new Date();
        const nextDate = data
          .map((row) => new Date(row.disbursement_date))
          .find((d) => d > now);

        if (nextDate) {
          setDisbursementDate(nextDate);
        }
      }
    };

    fetchDisbursementDate();
  }, []);

  // ✅ Countdown logic
  useEffect(() => {
    if (!disbursementDate) return;

    const interval = setInterval(() => {
      const deadline = new Date(disbursementDate);
      const diff = deadline - new Date();

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [disbursementDate]);



  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Globe animation variants
  const globeVariants = {
    initial: { scale: 0.9, opacity: 0.4 },
    animate: {
      rotate: 360,
      scale: [0.9, 0.95, 0.9],
      opacity: [0.4, 0.6, 0.4],
      transition: {
        rotate: { duration: 50, repeat: Infinity, ease: "linear" },
        scale: { duration: 3, repeat: Infinity, repeatType: "reverse" },
        opacity: { duration: 3, repeat: Infinity, repeatType: "reverse" },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.5 }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-300/40 text-2xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: ["0%", "-150%"],
              x: [`${Math.random() * 40 - 20}%`, `${Math.random() * 40 - 20}%`],
              rotate: [0, 180],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 12 + Math.random() * 6,
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 0.4,
            }}
          >
            {React.createElement(
              [FaRocket, FaBitcoin, FaMoneyBillWave, FaLeaf][Math.floor(Math.random() * 4)]
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Navbar */}
      <motion.nav
        className="bg-gray-800/95 backdrop-blur-md shadow-md py-4 px-6 fixed w-full z-50"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto flex justify-between items-center">


<Link to="/" className="text-xl font-bold text-cyan-300 tracking-tight">
  <img src={favicon} alt="Swiss Grant" className="w-6 h-6 inline-block " />
  <span>Swiss Grant</span>
</Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-200 text-sm font-medium hover:text-cyan-300 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r text-sm from-cyan-400 to-blue-500 text-white px-2 py-1 rounded-full font-semibold hover:scale-105 transition-transform duration-200 shadow-md"
            >
            Register
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.header
        className="relative bg-gradient-to-br from-blue-800 via-cyan-700 to-blue-500 text-white pt-36 pb-28 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Rotating Globe */}
        <motion.div
          className="absolute top-8 right-8 w-[360px] h-[360px] opacity-50 pointer-events-none"
          variants={globeVariants}
          initial="initial"
          animate="animate"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Earth_Western_Hemisphere.jpg"
            alt="Rotating Globe"
            className="w-full h-full object-cover rounded-full shadow-lg"
            style={{ filter: "drop-shadow(0 0 15px rgba(6, 182, 212, 0.4))" }}
          />
        </motion.div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-200"
            variants={itemVariants}
          >
            Transforming Lives Through Grants
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl mb-8 max-w-xl mx-auto text-gray-100"
            variants={itemVariants}
          >
            Unlock funding for agriculture, sustainability, and food security with the Swiss Crypto Grant Program, empowering communities worldwide.
          </motion.p>

        {/* Countdown Timer */}
          {disbursementDate ? (
            <motion.div
              className="flex justify-center mb-8 space-x-4 text-white text-base font-semibold"
              variants={itemVariants}
            >
              {["days", "hours", "minutes", "seconds"].map((unit) => (
                <motion.div
                  key={unit}
                  className="bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-md border border-cyan-400/20 shadow-md"
                  whileHover={{ scale: 1.1 }}
                >
                  <span>
                    {timeLeft[unit]} {unit}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-gray-300">Loading disbursement date...</p>
          )}

          <motion.div className="flex justify-center space-x-3" variants={itemVariants}>
            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-full hover:scale-105 transition-transform duration-200 shadow-md"
            >
            Register as a CEO
            </Link>
            <Link
              to="/login"
              className="px-6 py-2 border border-cyan-300/50 bg-transparent text-cyan-300 font-semibold rounded-full hover:bg-cyan-300 hover:text-gray-900 transition-all duration-200 shadow-md"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* Features Section */}
      <section className="bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-10 text-cyan-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Core Strengths
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaLock,
                title: "Trusted Funding",
                desc: "Secure grants with blockchain-backed transparency for agriculture and sustainability projects.",
              },
              {
                icon: FaGlobe,
                title: "Global Impact",
                desc: "Empowering Africa and beyond with funding to unlock potential in underserved regions.",
              },
              {
                icon: FaLeaf,
                title: "Sustainable Growth",
                desc: "Support eco-friendly initiatives for food security and rural development worldwide.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-cyan-400/20 transition-all duration-300 border border-cyan-400/10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ scale: 1.03 }}
              >
                <feature.icon className="text-cyan-300 text-3xl mb-3 mx-auto" />
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-200 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-8 text-cyan-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            About the Swiss Crypto Grant
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-center mb-10 max-w-2xl mx-auto text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The Swiss Crypto Grant Program drives global progress by providing funding for agriculture, sustainability, and food security, with a focus on empowering underdeveloped regions, especially in Africa. In partnership with organizations like the FAO, we deliver innovative, transparent solutions to support transformative projects worldwide.
          </motion.p>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl shadow-md border border-cyan-400/10"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-white">Our Mission</h3>
              <p className="text-gray-200 text-sm">
                To empower communities through accessible grants, fostering innovation and sustainable development in agriculture and beyond.
              </p>
            </motion.div>
            <motion.div
              className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl shadow-md border border-cyan-400/10"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-white">Our Impact</h3>
              <p className="text-gray-200 text-sm">
                Supporting transformative projects in Africa and globally, aligned with FAO’s goals for food security and rural prosperity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-10 text-cyan-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Key Programs
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Sustainable Agriculture",
                desc: "Funding projects like FAO’s Green-Ag in India to promote eco-friendly farming and biodiversity conservation.",
              },
              {
                title: "Food Security",
                desc: "Supporting initiatives like Nourish and Thrive in Zimbabwe to address nutrition in drought-affected regions.",
              },
              {
                title: "Digital Innovation",
                desc: "Empowering African farmers in Malawi and Rwanda with digital tools for climate resilience and market access.",
              },
            ].map((program, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-cyan-400/20 transition-all duration-300 border border-cyan-400/10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-xl font-semibold mb-2 text-white">{program.title}</h3>
                <p className="text-gray-200 text-sm">{program.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-gradient-to-br from-blue-800 to-gray-900 py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-10 text-cyan-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Global Reach
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "12K+", label: "Grants Awarded" },
              { value: "65+", label: "Countries Reached" },
              { value: "98%", label: "Success Rate" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 backdrop-blur-sm p-5 rounded-xl shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <h3 className="text-2xl font-bold text-cyan-300">{stat.value}</h3>
                <p className="text-gray-200 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-16 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 animate-gradient-x"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
        />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Fund Your Future Today
          </motion.h2>
          <motion.p
            className="text-base md:text-lg mb-6 max-w-md mx-auto text-gray-100"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join the Swiss Crypto Grant Program to drive agriculture, sustainability, and innovation worldwide.
          </motion.p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-transform duration-200 shadow-md hover:scale-105"
            >
              Start Your Journey
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800/95 backdrop-blur-md py-6 text-center text-gray-200 border-t border-gray-700">
        <div className="container mx-auto px-6">
          <p className="mb-3 text-sm">© 2025 Swiss Crypto Grant Program. All rights reserved.</p>
          <div className="flex justify-center space-x-4 text-sm">
            <a href="#" className="hover:text-cyan-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-300 transition-colors">Terms of Service</a>
            <Link to="/contact" className="hover:text-cyan-300 transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>

      {/* Tailwind Custom Styles */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 12s ease infinite;
        }
      `}</style>
    </div>
  );
}