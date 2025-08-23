
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const EmailVerified = () => {
  const [showRedirect, setShowRedirect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show redirect message after 3 seconds
    const timer1 = setTimeout(() => {
      setShowRedirect(true);
    }, 3000);

    // Redirect to dashboard after additional 2 seconds
    const timer2 = setTimeout(() => {
      navigate('/login'); // Replace with your actual dashboard route
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        className="flex flex-col items-center justify-center w-full max-w-md p-8 bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl animate-gradient-x"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <AnimatePresence mode="wait">
          {!showRedirect ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <CheckCircle className="w-16 h-16 text-cyan-400 mb-4 mx-auto" />
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                Your Email Has Been Verified
              </h1>
              <p className="text-gray-200 text-center mb-6">
                Congratulations! Your email has been successfully verified. You'll be redirected to your dashboard shortly.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="redirect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="w-8 h-8 border-4 border-t-cyan-500 border-gray-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-200 text-lg font-semibold">Redirecting...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background: linear-gradient(90deg, #06b6d4, #7c3aed, #db2777, #06b6d4);
          background-size: 200% 200%;
          animation: gradient-x 8s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default EmailVerified;
