import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { Copy, QrCode, Clock, Loader2, CheckCircle } from "lucide-react";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const type = state.type || "ceo_gas_fee";
  const totalAmount = state.totalAmount || 6.7;
  const beneficiaries = state.beneficiaries || [];
  const userIdFromState = state.userId || null;

  const [transactionId, setTransactionId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(userIdFromState);
  const [showModal, setShowModal] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState("");

  const walletAddress = "0xd426B37B5044A56C1a6c567dDb0c283B402247Ca";
  const [showQRModal, setShowQRModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!userId) {
      (async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          toast.error("Please log in to proceed.");
          navigate("/login");
        } else {
          setUserId(user.id);
        }
      })();
    }
  }, [userId, navigate]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0 && timer) {
      clearInterval(timer);
      setTimeLeft(300);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCopy = () => {
    setShowCopyModal(true);
  };

  const confirmCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied!");
    setTimeLeft(300);
    setShowCopyModal(false);
  };

  const handleQR = () => {
    setShowQRModal(true);
    setTimeLeft(300);
  };

  const handleVerifyPayment = async () => {
    if (!userId || !transactionId || !/^0x[a-fA-F0-9]{64}$/.test(transactionId) || !file) {
      toast.error('Please fill all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      // Upload receipt
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('pictures')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData, error: urlError } = supabase.storage
        .from('pictures')
        .getPublicUrl(fileName);
      if (urlError || !urlData?.publicUrl) throw urlError;

      setReceiptUrl(urlData.publicUrl);

      // Insert payment verification
      const { error: verificationError } = await supabase
        .from('payment_verifications')
        .insert({
          user_id: userId,
          transaction_hash: transactionId,
          receipt_url: urlData.publicUrl,
          amount: totalAmount,
          type,
        });
      if (verificationError) throw verificationError;

      // === CEO Gas Fee ===
      if (type === 'ceo_gas_fee') {
        const { data: gasFeeData } = await supabase
          .from('gas_fees')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'ceo_gas_fee')
          .maybeSingle();

        if (!gasFeeData) {
          await supabase.from('gas_fees').insert({
            user_id: userId,
            deposited: true,
            verified: true,
            type: 'ceo_gas_fee',
          });
        } else {
          await supabase.from('gas_fees')
            .update({ deposited: true, verified: true })
            .eq('user_id', userId)
            .eq('type', 'ceo_gas_fee');
        }

        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'grant',
          amount: 0.4,
          currency: 'BTC',
          description: 'CEO Gas Fee Grant',
        });
      }

      // === Beneficiary Gas Fee ===
      if (type === 'beneficiary_gas_fee' && beneficiaries.length) {
        for (const b of beneficiaries) {
          let beneficiaryId = b.id;

          const { data: existing } = await supabase
            .from('beneficiaries')
            .select('*')
            .eq('user_id', userId)
            .eq('id', b.id)
            .maybeSingle();

          if (!existing) {
            const { data: newB, error: insertBError } = await supabase
              .from('beneficiaries')
              .insert({
                user_id: userId,
                full_name: b.full_name,
                phone: b.phone,
                state: b.state,
                city: b.city,
                zipcode: b.zipcode,
                payment_verified: true,
              })
              .select()
              .single();
            if (insertBError) throw insertBError;
            beneficiaryId = newB.id;
          } else {
            await supabase.from('beneficiaries')
              .update({ payment_verified: true })
              .eq('id', beneficiaryId)
              .eq('user_id', userId);
          }

          const { data: bGasFee } = await supabase
            .from('gas_fees')
            .select('*')
            .eq('user_id', userId)
            .eq('beneficiary_id', beneficiaryId)
            .eq('type', 'beneficiary_gas_fee')
            .maybeSingle();

          if (!bGasFee) {
            await supabase.from('gas_fees').insert({
              user_id: userId,
              beneficiary_id: beneficiaryId,
              deposited: true,
              verified: true,
              type: 'beneficiary_gas_fee',
            });
          } else {
            await supabase.from('gas_fees')
              .update({ deposited: true, verified: true })
              .eq('user_id', userId)
              .eq('beneficiary_id', beneficiaryId)
              .eq('type', 'beneficiary_gas_fee');
          }
        }
      }

      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to process payment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInputModal = () => {
    setShowInputModal(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .gradient-bg {
            background: linear-gradient(45deg, #111827, #1f2937, #374151, #111827);
            background-size: 200% 200%;
            animation: gradientShift 15s ease infinite;
          }
          .glass-effect {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .hover-scale {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .hover-scale:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          }
          .glow-effect {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          }
          .fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      {/* Payment Form */}
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
        <div className="glass-effect p-8 rounded-3xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl border border-gray-700 fade-in">
          <h2 className="text-4xl font-extrabold mb-6 text-center text-blue-400">
            Verify Payment
          </h2>

          <div className="text-sm text-gray-300 uppercase tracking-widest text-center mb-8 flex items-center justify-center gap-2">
            <span className="text-yellow-400 text-lg">⚠️ BSC (BEP20)</span> Network Only
          </div>

          <div className="glass-effect p-6 rounded-2xl mb-8 border border-gray-700">
            <p className="text-center text-gray-400 text-sm font-medium mb-3">Wallet Address</p>
            <p className="text-blue-400 text-lg font-mono break-all text-center bg-gray-900/50 p-3 rounded-lg">
              {walletAddress}
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover-scale glow-effect"
              >
                <Copy size={18} /> Copy Address
              </button>
              <button
                onClick={handleQR}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover-scale glow-effect"
              >
                <QrCode size={18} /> Show QR
              </button>
            </div>

            {timeLeft > 0 && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-400 font-medium">
                <Clock size={16} /> Expires in: {formatTime(timeLeft)}
              </div>
            )}
          </div>

          <p className="text-center mb-8 font-semibold text-xl">
            Amount: <span className="text-yellow-400 font-bold">{totalAmount} USDT</span>
          </p>

          <button
            onClick={handleOpenInputModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 hover-scale glow-effect"
          >
            Enter Payment Details
          </button>
        </div>
      </div>

      {/* Copy Address Confirmation Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect p-6 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-gray-700 fade-in">
            <h3 className="text-2xl font-bold mb-3 text-blue-400">Confirm Copy</h3>
            <p className="mb-4 text-gray-300">Copy wallet address to clipboard?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmCopy}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold hover-scale glow-effect"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowCopyModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold hover-scale"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect p-6 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-gray-700 fade-in">
            <h3 className="text-2xl font-bold mb-3 text-blue-400">Wallet QR Code</h3>
            <div className="flex justify-center mb-4 animate-pulse">
              <QRCode
                value={walletAddress}
                size={180}
                bgColor="#111827"
                fgColor="#3b82f6"
                className="p-3 rounded-lg bg-gray-900/30 border border-gray-700"
              />
            </div>
            {timeLeft > 0 && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-green-400 font-medium">
                <Clock size={16} /> Expires in: {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={() => setShowQRModal(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold hover-scale"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment Input Modal */}
      {showInputModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-700 fade-in">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Enter Payment Details</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Hash</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                placeholder="0x..."
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload Receipt</label>
              <input
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleVerifyPayment}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 hover-scale glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="animate-spin" size={20} />}
                {loading ? "Processing..." : "Verify Payment"}
              </button>
              <button
                onClick={() => setShowInputModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold hover-scale"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-700 fade-in">
            <CheckCircle className="text-green-400 w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h3 className="text-3xl font-bold mb-3 text-green-400">Payment Verified!</h3>
            <p className="mb-6 text-gray-300 text-lg">Your payment has been successfully verified.</p>

            {receiptUrl && (
              <div className="mb-6">
                {receiptUrl.endsWith(".pdf") ? (
                  <div className="text-white bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    📄 PDF Uploaded Successfully
                  </div>
                ) : (
                  <img
                    src={receiptUrl}
                    alt="Receipt"
                    className="mx-auto rounded-lg max-h-72 object-contain border border-gray-700 shadow-lg"
                  />
                )}
              </div>
            )}

            <button
              onClick={() => {
                setShowModal(false);
                navigate(type === "ceo_gas_fee" ? "/ceo_dashboard" : "/ceo_dashboard");
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold hover-scale glow-effect"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentPage;