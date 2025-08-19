// src/pages/Withdrawal.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bitcoin, DollarSign, Send, CreditCard } from "lucide-react";

export default function WithdrawalPage({
  walletBalanceBTC = 0.05,
  walletBalanceUSDT = 500,
  handleWithdraw,
}) {
  const [currency, setCurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [withdrawType, setWithdrawType] = useState("onchain"); // onchain or exchange
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="flex-1 p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Withdrawal</h1>

      {/* Wallet Balances */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-950 to-indigo-950 p-6 rounded-3xl shadow-lg backdrop-blur-lg mb-6"
      >
        <h2 className="text-lg font-semibold text-white mb-2">
          Wallet Balances
        </h2>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bitcoin className="text-cyan-400" />
            <p className="text-white font-medium">{walletBalanceBTC} BTC</p>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="text-cyan-400" />
            <p className="text-white font-medium">{walletBalanceUSDT} USDT</p>
          </div>
        </div>
      </motion.div>

      {/* Withdrawal Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-3xl shadow-lg mb-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Make a Withdrawal
        </h2>

        {/* Withdrawal Type */}
        <div className="flex space-x-6 mb-4">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              value="onchain"
              checked={withdrawType === "onchain"}
              onChange={(e) => setWithdrawType(e.target.value)}
              className="sr-only"
            />
            <div
              className={`px-4 py-2 rounded-xl border ${
                withdrawType === "onchain"
                  ? "bg-indigo-600 border-indigo-400"
                  : "bg-gray-700 border-gray-600"
              } text-white font-medium`}
            >
              <span className="flex items-center space-x-1">
                <Bitcoin size={16} />
                <span>On-chain</span>
              </span>
            </div>
          </label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              value="exchange"
              checked={withdrawType === "exchange"}
              onChange={(e) => setWithdrawType(e.target.value)}
              className="sr-only"
            />
            <div
              className={`px-4 py-2 rounded-xl border ${
                withdrawType === "exchange"
                  ? "bg-indigo-600 border-indigo-400"
                  : "bg-gray-700 border-gray-600"
              } text-white font-medium`}
            >
              <span className="flex items-center space-x-1">
                <CreditBank size={16} />
                <span>Exchange</span>
              </span>
            </div>
          </label>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-gray-300 font-medium">Currency:</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-xl w-full"
            >
              <option value="BTC">BTC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 font-medium mb-1">
              {withdrawType === "onchain"
                ? "Recipient Wallet Address"
                : "Exchange Account ID"}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={
                withdrawType === "onchain"
                  ? "Enter wallet address"
                  : "Enter exchange account"
              }
              className="p-2 rounded-xl bg-gray-700 text-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 font-medium mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="p-2 rounded-xl bg-gray-700 text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                handleWithdraw(currency, amount, recipient, withdrawType)
              }
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center space-x-2"
            >
              <Send size={16} />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
