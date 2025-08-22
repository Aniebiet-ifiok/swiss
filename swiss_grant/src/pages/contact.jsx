import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle, FaTimes } from "react-icons/fa";
import favicon from '../assets/favicon.png';
import { supabase } from '../supabase';
import toast from "react-hot-toast";

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

// Modal animation variants
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
};

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (formData.name.length < 2) {
      toast.error("Name must be at least 2 characters long.");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (formData.subject.length < 5) {
      toast.error("Subject must be at least 5 characters long.");
      return false;
    }
    if (formData.message.length < 10) {
      toast.error("Message must be at least 10 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Check for recent submissions (rate limiting: 1 message per email per 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentMessages, error: recentError } = await supabase
        .from("contact_messages")
        .select("id")
        .eq("email", formData.email)
        .gte("created_at", fiveMinutesAgo);

      if (recentError) throw recentError;
      if (recentMessages.length > 0) {
        toast.error("Please wait a few minutes before sending another message.");
        setIsSubmitting(false);
        return;
      }

      // Get authenticated user ID (if logged in)
      const { data: { user } } = await supabase.auth.getUser();

      // Insert form data into contact_messages table
      const { error } = await supabase
        .from("contact_messages")
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          user_id: user ? user.id : null, // Include user_id if authenticated
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      setShowModal(true); // Show modal on success
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Error submitting contact form:", err);
      toast.error(err.message === "You must be logged in to perform this action" 
        ? "Please log in to send a message."
        : "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
              [FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane][Math.floor(Math.random() * 4)]
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Navbar */}
      <motion.nav
        className="bg-gray-800/95 backdrop-blur-md shadow-md py-4 px-4 sm:px-6 fixed w-full z-50"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-lg sm:text-xl font-bold text-cyan-300 tracking-tight">
            <img src={favicon} alt="Swiss Grant" className="w-5 h-5 sm:w-6 sm:h-6 inline-block mr-2" />
            <span>Swiss Grant</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              to="/"
              className="text-gray-200 text-sm font-medium hover:text-cyan-300 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="text-gray-200 text-sm font-medium hover:text-cyan-300 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r text-sm from-cyan-400 to-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold hover:scale-105 transition-transform duration-200 shadow-md"
            >
              Register
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.header
        className="relative bg-gradient-to-br from-blue-800 via-cyan-700 to-blue-500 text-white pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="absolute top-4 sm:top-8 right-4 sm:right-8 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 opacity-50 pointer-events-none"
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
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-200"
            variants={itemVariants}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-xl mx-auto text-gray-100"
            variants={itemVariants}
          >
            Have questions or need assistance? Reach out to the Swiss Crypto Grant Program team, and we'll get back to you promptly.
          </motion.p>
        </div>
      </motion.header>

      {/* Contact Form Section */}
      <section className="bg-gray-800 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 text-cyan-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Get in Touch
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <motion.div
              className="bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-cyan-400/10"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.03 }}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Contact Information</h3>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-200">
                <p className="flex items-center gap-2">
                  <FaEnvelope className="text-cyan-300" />
                  Email: <a href="mailto:support@swissgrant.org" className="hover:text-cyan-300 transition-colors">support@swissgrant.org</a>
                </p>
                <p className="flex items-center gap-2">
                  <FaPhone className="text-cyan-300" />
                  Phone: <a href="tel:+1234567890" className="hover:text-cyan-300 transition-colors">+1 (234) 567-890</a>
                </p>
                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-cyan-300" />
                  Address: 123 Grant Avenue, Zurich, Switzerland
                </p>
              </div>
            </motion.div>
            <motion.div
              className="bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-cyan-400/10"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.03 }}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-200">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-xs sm:text-sm"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-200">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-xs sm:text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-200">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-xs sm:text-sm"
                    placeholder="Enter subject"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-200">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-xs sm:text-sm resize-none h-24 sm:h-32"
                    placeholder="Enter your message"
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-full hover:scale-105 transition-transform duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPaperPlane size={16} />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Response Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative bg-gray-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl w-full max-w-md sm:max-w-lg overflow-y-auto max-h-[90vh] box-border"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
              >
                <FaTimes size={20} />
              </button>
              <div className="text-center">
                <FaCheckCircle className="text-cyan-300 text-4xl sm:text-5xl mx-auto mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Message Sent!</h2>
                <p className="text-sm sm:text-base text-gray-200 mb-4 sm:mb-6">
                  Thank you for contacting the Swiss Crypto Grant Program. Your message has been received, and we'll respond within 24 hours.
                </p>
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-full hover:scale-105 transition-transform duration-200 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-800/95 backdrop-blur-md py-6 text-center text-gray-200 border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="mb-3 text-xs sm:text-sm">© 2025 Swiss Crypto Grant Program. All rights reserved.</p>
          <div className="flex justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
            <Link to="/privacy" className="hover:text-cyan-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-cyan-300 transition-colors">Terms of Service</Link>
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