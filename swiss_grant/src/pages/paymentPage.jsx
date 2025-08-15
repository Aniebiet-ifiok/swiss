import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "../supabase";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const TRUST_WALLET = "0xYourTrustWalletAddress";
const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT ERC20
const PAYMENT_AMOUNT = 6.2;

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};
  const [walletConnected, setWalletConnected] = useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [paymentDetected, setPaymentDetected] = useState(false);
  const [confirmationCount, setConfirmationCount] = useState(0);
  const [listening, setListening] = useState(false);

  const CONFIRMATION_TARGET = 3; // Show animation for 3 "confirmations"

  const connectWallet = async () => {
    if (!window.ethereum) return toast.error("MetaMask not detected!");
    try {
      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setUserWallet(account);
      setWalletConnected(true);
      toast.success("Wallet connected successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect wallet.");
    }
  };

  // Listen for USDT Transfer events
  useEffect(() => {
    if (!walletConnected || !userWallet || listening) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const usdtContract = new ethers.Contract(
      USDT_CONTRACT,
      ["event Transfer(address indexed from, address indexed to, uint256 value)"],
      provider
    );

    const onTransfer = async (from, to, value) => {
      if (
        from.toLowerCase() === userWallet.toLowerCase() &&
        to.toLowerCase() === TRUST_WALLET.toLowerCase()
      ) {
        const amount = Number(ethers.utils.formatUnits(value, 6));
        if (amount >= PAYMENT_AMOUNT) {
          setPaymentDetected(true);
        }
      }
    };

    usdtContract.on("Transfer", onTransfer);
    setListening(true);

    return () => {
      usdtContract.off("Transfer", onTransfer);
      setListening(false);
    };
  }, [walletConnected, userWallet, listening]);

  // Handle countdown / confirmation animation
  useEffect(() => {
    if (!paymentDetected) return;
    if (confirmationCount >= CONFIRMATION_TARGET) {
      // Update Supabase and redirect
      (async () => {
        const { error } = await supabase
          .from("users")
          .update({ has_paid: true })
          .eq("id", userId);

        if (error) return toast.error(error.message);

        toast.success("Payment confirmed! Redirecting to your dashboard...");
        navigate("/ceo_dashboard");
      })();
      return;
    }

    const timer = setTimeout(() => {
      setConfirmationCount((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [paymentDetected, confirmationCount, navigate, userId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="bg-gray-900/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center space-y-6">
        <h2 className="text-4xl font-extrabold text-yellow-400">Secure Your Access</h2>
        <p className="text-gray-300 text-lg">
          Send <span className="font-bold text-white">6.2 USDT</span> from your wallet to unlock your dashboard.
        </p>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-500 font-mono text-yellow-300 break-all">
          {TRUST_WALLET}
        </div>

        {!walletConnected && (
          <button
            onClick={connectWallet}
            className="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
          >
            Connect Wallet
          </button>
        )}

        {walletConnected && !paymentDetected && (
          <p className="text-gray-400 mt-4">Wallet connected. Waiting for your payment...</p>
        )}

        <AnimatePresence>
          {paymentDetected && confirmationCount < CONFIRMATION_TARGET && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-green-400 font-bold text-xl"
            >
              Confirming payment... {confirmationCount}/{CONFIRMATION_TARGET}
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
          Need help? Contact support for assistance.
        </p>
      </div>
    </div>
  );
}
