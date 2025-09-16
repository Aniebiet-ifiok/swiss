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
  const [showQRModal, setShowQRModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const walletAddress = "0x5fe4554023d0a75f543fb650f595a807d9db07086956e2f84040ba576d0e0107";

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('Auth error:', error);
        toast.error("Please log in to proceed.");
        navigate("/login");
      } else {
        console.log('Authenticated user ID:', user.id, 'State userId:', userIdFromState);
        setUserId(user.id); // Always use authenticated user ID
      }
    };

    if (!userId || userId !== userIdFromState) {
      fetchUser();
    }
  }, [userId, userIdFromState, navigate]);

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

      // Insert payment verification as PENDING
      const tableName = type === 'ceo_gas_fee' ? 'ceo_gas_fee_verifications' : 'beneficiary_gas_fee_verifications';
      const payload = {
        user_id: userId,
        transaction_hash: transactionId,
        receipt_url: urlData.publicUrl,
        amount: totalAmount,
        status: 'pending',
      };

      if (type === 'beneficiary_gas_fee') {
        payload.beneficiary_count = beneficiaries.length;
      }

      console.log('Inserting into', tableName, 'with payload:', payload);
      const { error: verificationError } = await supabase
        .from(tableName)
        .insert(payload);
      if (verificationError) {
        console.error('Verification insert error:', verificationError);
        throw verificationError;
      }

      // Insert beneficiaries for beneficiary_gas_fee
      if (type === 'beneficiary_gas_fee' && beneficiaries.length > 0) {
        // Validate beneficiaries
        const isValid = beneficiaries.every((ben) => {
          if (!ben.full_name || ben.full_name.trim() === "") {
            toast.error("Full name is required for all beneficiaries");
            return false;
          }
          if (!ben.phone || !/^\+?\d{10,14}$/.test(ben.phone)) {
            toast.error("Valid phone number is required for all beneficiaries");
            return false;
          }
          if (!ben.state || ben.state.trim() === "") {
            toast.error("State is required for all beneficiaries");
            return false;
          }
          if (!ben.city || ben.city.trim() === "") {
            toast.error("City is required for all beneficiaries");
            return false;
          }
          if (!ben.zipcode || !/^\d{5,6}$/.test(ben.zipcode)) {
            toast.error("Valid zip code is required for all beneficiaries");
            return false;
          }
          return true;
        });

        if (!isValid) {
          setLoading(false);
          return;
        }

        // Prepare beneficiary payload
        const beneficiaryPayload = beneficiaries.map((ben) => ({
          user_id: userId,
          full_name: ben.full_name,
          phone: ben.phone,
          state: ben.state,
          city: ben.city,
          zipcode: ben.zipcode,
          payment_verified: false,
          created_at: new Date().toISOString(),
        }));

        console.log('Inserting beneficiaries:', beneficiaryPayload);
        const { error: insertError } = await supabase
          .from('beneficiaries')
          .insert(beneficiaryPayload);
        if (insertError) {
          console.error('Beneficiary insert error:', insertError);
          throw insertError;
        }

        // Clear sessionStorage
        sessionStorage.removeItem('pendingBeneficiaries');

        // Send confirmation email
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          const userEmail = userData.user?.email;
          if (userEmail) {
            const { error: emailError } = await supabase.functions.invoke('send-email', {
              body: {
                email: userEmail,
                subject: 'Beneficiary Payment Submitted',
                message: `Your payment of ${totalAmount} USDT for ${beneficiaries.length} beneficiaries has been submitted and is awaiting verification.`,
              },
            });
            if (emailError) console.error('Email error:', emailError);
          } else {
            console.warn('No user email found');
          }
        } catch (emailErr) {
          console.error('Failed to send email:', emailErr);
        }
      }

      toast.success('Payment details submitted! Awaiting manual verification by admin.');
      setShowModal(true);
    } catch (err) {
      console.error('Payment error:', err);
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
            Verify {type === 'ceo_gas_fee' ? 'CEO' : 'Beneficiary'} Gas Fee Payment
          </h2>

          <div className="text-sm text-gray-300 uppercase tracking-widest text-center mb-8 flex items-center justify-center gap-2">
            <span className="text-yellow-400 text-lg">⚠️ Aptos</span> Network Only
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
                {loading ? "Processing..." : "Submit for Verification"}
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

      {/* Payment Submission Confirmation Modal (Pending Status) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-700 fade-in">
            <CheckCircle className="text-yellow-400 w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h3 className="text-3xl font-bold mb-3 text-yellow-400">Payment Submitted!</h3>
            <p className="mb-6 text-gray-300 text-lg">
              Your {type === 'ceo_gas_fee' ? 'CEO' : 'beneficiary'} gas fee payment details have been submitted and are awaiting verification.
            </p>
            <p className="mb-6 text-sm text-gray-400">You will be notified once approved. Check your dashboard for status updates.</p>

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
                navigate("/ceo_dashboard?refresh=true");
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-xl font-semibold hover-scale glow-effect"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentPage;