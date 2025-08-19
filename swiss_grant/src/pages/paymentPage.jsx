import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, QrCode, X, Upload } from "lucide-react";
import QRCode from "react-qr-code";

const TRUST_WALLET = "0xd426B37B5044A56C1a6c567dDb0c283B402247Ca";
const TIMER_DURATION = 5 * 60; // 5 minutes in seconds

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, totalAmount = 6.70 } = location.state || {}; // Default to 6.70 if totalAmount is not provided
  const [paymentDetected, setPaymentDetected] = useState(false);
  const [confirmationCount, setConfirmationCount] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [timerStarted, setTimerStarted] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  const CONFIRMATION_TARGET = 3;

  // Timer logic with auto-restart
  useEffect(() => {
    if (!timerStarted) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          // Restart the timer automatically (e.g., 300s = 5 min)
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted]);

  // Simulated confirmation flow
  useEffect(() => {
    if (!paymentDetected) return;
    if (confirmationCount >= CONFIRMATION_TARGET) {
      (async () => {
        const { error } = await supabase
          .from("users")
          .update({ has_paid: true })
          .eq("id", userId);

        if (error) return toast.error(error.message);
        toast.success("Payment confirmed! Redirecting...");
        navigate("/ceo_dashboard");
      })();
      return;
    }
    const timer = setTimeout(() => {
      setConfirmationCount((prev) => prev + 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [paymentDetected, confirmationCount, navigate, userId]);

  const copyAddress = () => {
    navigator.clipboard.writeText(TRUST_WALLET);
    toast.success("Wallet address copied!");
    setTimerStarted(true);
  };

  const handleShowQR = () => {
    setShowQR(true);
    setTimerStarted(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      toast.success("Receipt selected!");
    }
  };

  const handleVerifyPayment = async () => {
    if (!transactionId || !receiptFile) {
      toast.error("Please provide transaction ID and receipt.");
      return;
    }
    // Simulate payment verification (replace with actual API call)
    toast.success("Payment verification submitted!");
    setPaymentDetected(true);
    setShowPaymentModal(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-black to-blue-950 text-white p-6 relative overflow-hidden">
      {/* Background Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="absolute w-[600px] h-[600px] bg-cyan-500/30 rounded-full blur-3xl -top-40 -left-40"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        className="absolute w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]"
      />

      {/* Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-[70%] relative bg-gray-900/80 backdrop-blur-2xl border border-cyan-500/20 
        p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center space-y-6 z-10"
      >
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-cyan-400 drop-shadow-lg">
          Secure Your Access
        </h2>
        <p className="text-gray-300 text-lg">
          Send{" "}
          <span className="font-bold text-white">{totalAmount.toFixed(2)} USDT</span> to
          the wallet address below to unlock your dashboard.
        </p>

        {/* Timer */}
        {timerStarted && (
          <div className="text-yellow-300 font-bold text-lg">
            Time remaining: {formatTime(timer)}
          </div>
        )}

        {/* Wallet Section */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/60 p-5 rounded-xl border border-cyan-400/30 font-mono text-yellow-300 
          break-all flex flex-col items-center space-y-4 shadow-inner shadow-black/40"
        >
          <span className="text-lg">{TRUST_WALLET}</span>
          <div className="flex gap-3">
            <button
              onClick={copyAddress}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 
              flex items-center gap-2 font-medium shadow-md hover:shadow-green-400/50 
              hover:scale-105 transition-all"
            >
              <Copy size={16} /> Copy
            </button>
            <button
              onClick={handleShowQR}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
              flex items-center gap-2 font-medium shadow-md hover:shadow-blue-400/50 
              hover:scale-105 transition-all"
            >
              <QrCode size={16} /> Show QR
            </button>
          </div>
          <p className="text-sm text-white font-bold uppercase tracking-wide">
            ⚠️ Use only <span className="text-yellow-300 text-lg">ERC20</span>{" "}
            Network
          </p>
        </motion.div>

        {/* Verify Payment Button */}
        <button
          onClick={() => setShowPaymentModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 
          flex items-center gap-2 font-medium shadow-md hover:shadow-purple-400/50 
          hover:scale-105 transition-all mx-auto"
        >
          <Upload size={16} /> Verify Payment
        </button>

        {/* Confirmation Status */}
        <AnimatePresence>
          {paymentDetected && confirmationCount < CONFIRMATION_TARGET && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <p className="text-green-400 font-bold text-xl mb-2">
                Confirming payment... {confirmationCount}/{CONFIRMATION_TARGET}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${
                      (confirmationCount / CONFIRMATION_TARGET) * 100
                    }%`,
                  }}
                  className="h-2 rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {paymentDetected && confirmationCount >= CONFIRMATION_TARGET && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-6 text-green-400 font-bold text-2xl"
          >
            ✅ Payment Confirmed!
          </motion.div>
        )}

        <p className="text-gray-500 text-sm mt-4">
          Need help? <span className="text-cyan-400">Contact Support</span>.
        </p>
      </motion.div>

      {/* QR Fullscreen Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative bg-white p-6 rounded-2xl shadow-2xl"
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition"
              >
                <X size={18} />
              </button>
              <QRCode value={TRUST_WALLET} size={220} />
              <p className="mt-4 text-gray-800 font-semibold text-sm">
                Scan to pay {totalAmount.toFixed(2)} USDT (ERC20)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Verification Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-md w-full text-white"
            >
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition"
              >
                <X size={18} />
              </button>
              <h3 className="text-2xl font-bold mb-4">Verify Your Payment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Transaction Hash
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Enter transaction hash"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload Receipt
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleVerifyPayment}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 
                  flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-purple-400/50 
                  hover:scale-105 transition-all"
                >
                  <Upload size={16} /> Submit Verification
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}