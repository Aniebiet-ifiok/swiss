import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket, FaBitcoin, FaMoneyBillWave } from "react-icons/fa";

export default function LandingPage() {
  // Countdown Timer (example: deadline in 7 days)
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // 7 days from now
    const interval = setInterval(() => {
      const now = new Date();
      const diff = deadline - now;
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
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
      {/* Flying icons */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white text-2xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: ["0%", "100%"],
              x: ["0%", `${Math.random() * 50 - 25}%`],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              repeatType: "loop",
              delay: i,
            }}
          >
            {React.createElement(
              [FaRocket, FaBitcoin, FaMoneyBillWave][
                Math.floor(Math.random() * 3)
              ]
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Navbar */}
      <nav className="bg-white/70 backdrop-blur-md shadow-md py-4 px-6 fixed w-full z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            SwissGrant
          </Link>
          <div className="space-x-4">
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.header
        className="relative bg-gradient-to-r from-blue-600 to-blue-400 text-white pt-36 pb-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Rotating Globe */}
        <div className="absolute top-10 right-10 w-80 h-80 opacity-70 pointer-events-none animate-spin-slow">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Earth_Western_Hemisphere.jpg"
            alt="Rotating Globe"
            className="w-full h-full object-contain rounded-full animate-spin-slow"
          />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1
            className="text-5xl font-extrabold mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Unlock Grants Effortlessly
          </motion.h1>
          <motion.p
            className="text-xl mb-8 max-w-xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Explore funding opportunities, manage applications, and track your
            progress — all in one mature, reliable platform.
          </motion.p>

          {/* Countdown Timer */}
          <motion.div
            className="flex justify-center mb-6 space-x-6 text-white text-lg font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
              {timeLeft.days}d
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
              {timeLeft.hours}h
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
              {timeLeft.minutes}m
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
              {timeLeft.seconds}s
            </div>
          </motion.div>

          <motion.div
            className="space-x-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              to="/register"
              className="px-6 py-3 bg-white/20 backdrop-blur-md text-blue-600 font-bold rounded-lg hover:bg-white/40 transition-transform transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 border border-white/50 bg-white/10 backdrop-blur-md text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition-transform transform hover:scale-105"
            >
              Login
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-4xl font-bold mb-12 text-blue-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            Why Choose SwissGrant?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Fast Approvals",
                desc: "Get your grant applications processed quickly and easily.",
              },
              {
                title: "Trusted Sources",
                desc: "All funding sources are verified and reliable. Trust us 100%.",
              },
              {
                title: "Easy Management",
                desc: "Track and manage all your grants in one place with ease.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
              >
                <h3 className="text-2xl font-semibold mb-4 text-blue-600">
                  {feature.title}
                </h3>
                <p className="text-gray-700">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-4xl font-bold mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to elevate your grants journey?
          </motion.h2>
          <motion.p
            className="text-lg mb-8 max-w-lg mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of professionals already benefiting from SwissGrant.
            Sign up today and start growing.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/register"
              className="px-8 py-4 bg-white/30 backdrop-blur-md text-blue-600 font-bold rounded-lg hover:bg-white/50 transition-transform transform hover:scale-105"
            >
              Sign Up Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur-md py-6 text-center text-gray-600 border-t mt-auto">
        © 2025 SwissGrant. All rights reserved.
      </footer>

      {/* Tailwind custom animation */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
