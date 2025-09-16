import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { FiUser, FiCalendar, FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiXCircle, FiSearch, FiEye } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function AdminDashboard() {
  const [ceoCount, setCeoCount] = useState(0);
  const [beneficiaryCount, setBeneficiaryCount] = useState(0);
  const [stateAnalytics, setStateAnalytics] = useState([]);
  const [notificationText, setNotificationText] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [editId, setEditId] = useState(null);
  const [roundStart, setRoundStart] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState({});
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [filterType, setFilterType] = useState('ceo');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [showRejectReason, setShowRejectReason] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Get WAT (Africa/Lagos) timestamp
  const getWATTimestamp = () => new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' });

  // Fetch counts and analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: ceoTotal, error: ceoError } = await supabase
          .from("ceo_profiles")
          .select("id", { count: "exact" })
          .eq("role", "ceo");
        if (ceoError) throw ceoError;
        setCeoCount(ceoTotal || 0);

        const { count: benTotal, error: benError } = await supabase
          .from("beneficiaries")
          .select("id", { count: "exact" });
        if (benError) throw benError;
        setBeneficiaryCount(benTotal || 0);

        const { data: analyticsData, error: analyticsError } = await supabase
          .from("beneficiaries")
          .select("state, id");
        if (analyticsError) throw analyticsError;
        if (analyticsData) {
          const stateMap = {};
          analyticsData.forEach((b) => {
            if (b.state) {
              stateMap[b.state] = (stateMap[b.state] || 0) + 1;
            }
          });
          setStateAnalytics(Object.keys(stateMap).map((state) => ({ state, beneficiaries: stateMap[state] })));
        } else {
          setStateAnalytics([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();
  }, []);

  // Fetch payment counts for all statuses
  const fetchPaymentCounts = async () => {
    try {
      const tables = ['ceo_gas_fee_verifications', 'beneficiary_gas_fee_verifications'];
      const counts = { pending: 0, verified: 0, rejected: 0 };

      for (const table of tables) {
        for (const status of ['pending', 'verified', 'rejected']) {
          const { count, error } = await supabase
            .from(table)
            .select('id', { count: 'exact' })
            .eq('status', status);
          if (error) throw error;
          counts[status] += count || 0;
        }
      }

      setStatusCounts(counts);
    } catch (err) {
      console.error('Error fetching payment counts:', err.message);
      toast.error('Failed to load payment counts');
    }
  };

  // Fetch payments for verification
  const fetchPayments = async (type = 'ceo', status = 'pending') => {
    setLoadingPayments(true);
    try {
      let paymentsData = [];
      if (status === 'pending') {
        const tableName = type === 'ceo' ? 'ceo_gas_fee_verifications' : 'beneficiary_gas_fee_verifications';
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        if (error) throw error;
        paymentsData = (data || []).map(payment => ({
          ...payment,
          type: type === 'ceo' ? 'ceo_gas_fee' : 'beneficiary_gas_fee'
        }));
      } else {
        const tables = ['ceo_gas_fee_verifications', 'beneficiary_gas_fee_verifications'];
        for (const table of tables) {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });
          if (error) throw error;
          const type = table === 'ceo_gas_fee_verifications' ? 'ceo_gas_fee' : 'beneficiary_gas_fee';
          paymentsData = [...paymentsData, ...(data || []).map(payment => ({
            ...payment,
            type
          }))];
        }
      }

      const paymentsWithUsers = await Promise.all(
        paymentsData.map(async (payment) => {
          const { data: user, error: userError } = await supabase.auth.getUser(payment.user_id);
          if (userError) {
            console.warn('User fetch failed for user:', payment.user_id, userError.message);
          }

          const displayName = user?.user?.user_metadata?.display_name || null;
          const email = user?.user?.email || 'unknown@example.com';

          return { 
            ...payment, 
            user_display_name: displayName,
            user_email: email,
          };
        })
      );

      console.log('Fetched payments:', { type, status, payments: paymentsData });
      setPayments(paymentsWithUsers);
    } catch (err) {
      console.error('Error fetching payments:', err.message);
      toast.error('Failed to load payments: ' + err.message);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchPayments(filterType, filterStatus);
    fetchPaymentCounts();
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filterType, filterStatus]);

  const handleApprovePayment = async (paymentId, type) => {
    setApprovingId(paymentId);
    try {
      const tableName = type === 'ceo_gas_fee' ? 'ceo_gas_fee_verifications' : 'beneficiary_gas_fee_verifications';
      const { data: paymentData, error: paymentError } = await supabase
        .from(tableName)
        .select('user_id, amount, beneficiary_count, created_at')
        .eq('id', paymentId)
        .single();
      if (paymentError) throw new Error(`Failed to fetch payment: ${paymentError.message}`);

      // Manually verify payment by setting status to 'verified'
      const { error: verificationError } = await supabase
        .from(tableName)
        .update({ 
          status: 'verified', 
          updated_at: getWATTimestamp() 
        })
        .eq('id', paymentId);
      if (verificationError) throw new Error(`Failed to set payment status to verified: ${verificationError.message}`);

      if (type === 'beneficiary_gas_fee' && paymentData.beneficiary_count > 0) {
        const { data: beneficiaries, error: beneficiaryError } = await supabase
          .from('beneficiaries')
          .select('id')
          .eq('user_id', paymentData.user_id)
          .eq('payment_verified', false)
          .gte('created_at', paymentData.created_at)
          .limit(paymentData.beneficiary_count);
        if (beneficiaryError) throw new Error(`Failed to fetch beneficiaries: ${beneficiaryError.message}`);

        if (!beneficiaries || beneficiaries.length < paymentData.beneficiary_count) {
          throw new Error(`Not enough unverified beneficiaries found for user ${paymentData.user_id}. Expected ${paymentData.beneficiary_count}, found ${beneficiaries?.length || 0}.`);
        }

        const beneficiaryIds = beneficiaries.map((b) => b.id);
        const { error: updateError } = await supabase
          .from('beneficiaries')
          .update({ payment_verified: true })
          .in('id', beneficiaryIds);
        if (updateError) throw new Error(`Failed to update beneficiaries: ${updateError.message}`);
      }

      const { data: userData, error: userError } = await supabase.auth.getUser(paymentData.user_id);
      if (userError || !userData.user?.email) {
        console.warn('Failed to fetch user email:', userError?.message);
      }

      const userEmail = userData?.user?.email || 'unknown@example.com';

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          email: userEmail,
          subject: type === 'ceo_gas_fee' ? 'CEO Gas Fee Payment Verified' : 'Beneficiary Payment Verified',
          message: `Your ${type === 'ceo_gas_fee' ? 'CEO' : 'beneficiary'} gas fee payment for ${
            type === 'ceo_gas_fee' ? '$6.70' : `${paymentData.beneficiary_count} ${paymentData.beneficiary_count === 1 ? 'beneficiary' : 'beneficiaries'}`
          } has been verified on ${getWATTimestamp()}.`,
        },
      });
      if (emailError) {
        console.error('Email error:', emailError.message);
      }

      toast.success('Payment verified successfully!');
      console.log('Payment verified:', { paymentId, type, timestamp: getWATTimestamp() });
      // Switch to Verified tab and fetch verified payments
      setFilterStatus('verified');
      setFilterType('all');
      setCurrentPage(1); // Show newest payments first
      await fetchPayments('all', 'verified');
      await fetchPaymentCounts();
    } catch (err) {
      console.error('Error verifying payment:', err.message);
      toast.error(`Failed to verify payment: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (paymentId, type) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      const tableName = type === 'ceo_gas_fee' ? 'ceo_gas_fee_verifications' : 'beneficiary_gas_fee_verifications';
      const { error } = await supabase
        .from(tableName)
        .update({ 
          status: 'rejected',
          reject_reason: rejectReason,
          updated_at: getWATTimestamp()
        })
        .eq('id', paymentId);
      if (error) throw new Error(`Failed to reject payment: ${error.message}`);

      const { data: paymentData, error: paymentError } = await supabase
        .from(tableName)
        .select('user_id')
        .eq('id', paymentId)
        .single();
      if (paymentError) throw new Error(`Failed to fetch payment: ${paymentError.message}`);

      const { data: userData, error: userError } = await supabase.auth.getUser(paymentData.user_id);
      if (userError || !userData.user?.email) {
        console.warn('Failed to fetch user email:', userError?.message);
      }

      const userEmail = userData?.user?.email || 'unknown@example.com';

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          email: userEmail,
          subject: type === 'ceo_gas_fee' ? 'CEO Gas Fee Payment Rejected' : 'Beneficiary Payment Rejected',
          message: `Your ${type === 'ceo_gas_fee' ? 'CEO' : 'beneficiary'} gas fee payment was rejected on ${getWATTimestamp()}. Reason: ${rejectReason}`,
        },
      });
      if (emailError) {
        console.error('Email error:', emailError.message);
      }

      toast.success('Payment rejected');
      setShowRejectReason(null);
      setRejectReason('');
      setFilterStatus('rejected');
      setFilterType('all');
      setCurrentPage(1);
      await fetchPayments('all', 'rejected');
      await fetchPaymentCounts();
    } catch (err) {
      console.error('Error rejecting payment:', err.message);
      toast.error('Failed to reject payment: ' + err.message);
    }
  };

  const handleDeletePayment = async (paymentId, type) => {
    if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return;
    }
    setDeletingId(paymentId);
    try {
      const tableName = type === 'ceo_gas_fee' ? 'ceo_gas_fee_verifications' : 'beneficiary_gas_fee_verifications';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', paymentId);
      if (error) throw new Error(`Failed to delete payment: ${error.message}`);

      toast.success('Payment deleted successfully!');
      console.log('Payment deleted:', { paymentId, type, timestamp: getWATTimestamp() });
      await fetchPayments(filterType, filterStatus);
      await fetchPaymentCounts();
    } catch (err) {
      console.error('Error deleting payment:', err.message);
      toast.error(`Failed to delete payment: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("disbursement_date")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Error fetching settings:", error.message);
        return;
      }

      if (data) {
        setRoundStart(new Date(data.disbursement_date));
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const deadline = new Date(roundStart);
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
  }, [roundStart]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error.message);
      return;
    }

    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const updateDisbursementDate = async (newDate) => {
    const { error } = await supabase
      .from("settings")
      .update({ disbursement_date: new Date(newDate).toLocaleString('en-US', { timeZone: 'Africa/Lagos' }) })
      .eq("id", 1);

    if (error) {
      console.error("Failed to update payout date:", error.message);
      toast.error(`Failed to update payout date: ${error.message}`);
    } else {
      toast.success("Disbursement date updated successfully!");
      setRoundStart(new Date(newDate));
    }
  };

  const saveNotification = async () => {
    if (!notificationText.trim()) return toast.error("Notification cannot be empty");

    let error;
    if (editId) {
      ({ error } = await supabase
        .from("notifications")
        .update({ message: notificationText })
        .eq("id", editId));
      if (!error) toast.success("Notification updated!");
    } else {
      ({ error } = await supabase
        .from("notifications")
        .insert([{ message: notificationText }]));
      if (!error) toast.success("Notification created!");
    }

    if (error) {
      toast.error(error.message);
    } else {
      setNotificationText("");
      setShowNotificationModal(false);
      setEditId(null);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Notification deleted!");
      fetchNotifications();
    }
  };

  const openEditModal = (notification) => {
    setNotificationText(notification.message);
    setEditId(notification.id);
    setShowNotificationModal(true);
  };

  // Pagination logic
  const indexOfLastPayment = currentPage * itemsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - itemsPerPage;
  const currentPayments = filterStatus === 'verified' 
    ? payments.slice(indexOfFirstPayment, indexOfLastPayment)
    : payments;
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">SuperAdmin Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div className="bg-gray-800/30 rounded-xl p-6 flex items-center gap-4">
          <FiUser size={32} className="text-blue-400" />
          <div>
            <p className="text-sm">Registered CEOs</p>
            <p className="text-2xl font-bold">{ceoCount}</p>
          </div>
        </motion.div>

        <motion.div className="bg-gray-800/30 rounded-xl p-6 flex items-center gap-4">
          <FiUser size={32} className="text-green-400" />
          <div>
            <p className="text-sm">Total Beneficiaries</p>
            <p className="text-2xl font-bold">{beneficiaryCount}</p>
          </div>
        </motion.div>

        <motion.div className="bg-gray-800/30 rounded-xl p-6 text-center">
          <FiCalendar size={36} className="mx-auto text-white mb-2" />
          <h2 className="text-xl font-bold">Next Payout</h2>
          <p className="text-lg">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
          <input
            type="datetime-local"
            className="mt-3 p-2 bg-gray-700 rounded"
            onChange={(e) =>
              updateDisbursementDate(new Date(e.target.value).toISOString())
            }
          />
        </motion.div>
      </div>

      {/* Payment Verification Section */}
      <motion.div className="bg-gray-800/30 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FiSearch /> Payment Verifications
        </h2>
        <div className="flex gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => { setFilterType('ceo'); setFilterStatus('pending'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded ${filterType === 'ceo' && filterStatus === 'pending' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700`}
            >
              CEO Gas Fees
            </button>
            <button
              onClick={() => { setFilterType('beneficiary'); setFilterStatus('pending'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded ${filterType === 'beneficiary' && filterStatus === 'pending' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700`}
            >
              Beneficiary Gas Fees
            </button>
          </div>
          <div className="flex gap-2">
            {['pending', 'verified', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => { setFilterStatus(status); setFilterType('all'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded ${filterStatus === status ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>
        {loadingPayments ? (
          <p>Loading payments...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Beneficiaries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Receipt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {currentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                      {payment.user_display_name || `Unknown User (${payment.user_id.slice(0, 8)})`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                      {payment.type === 'ceo_gas_fee' ? 'CEO Gas Fee' : 'Beneficiary Gas Fee'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{payment.amount} USDT</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                      {payment.type === 'beneficiary_gas_fee' ? (payment.beneficiary_count || 0) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-200 font-mono text-sm">
                      {payment.transaction_hash?.slice(0, 10) || 'N/A'}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {payment.receipt_url ? 'View' : 'N/A'}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                      <div className="flex gap-2">
                        {filterStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovePayment(payment.id, payment.type)}
                              disabled={approvingId === payment.id}
                              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                            >
                              <FiCheckCircle /> {approvingId === payment.id ? 'Verifying...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => setShowRejectReason(payment.id)}
                              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm flex items-center gap-1"
                            >
                              <FiXCircle /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <FiEye /> Details
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment.id, payment.type)}
                          disabled={deletingId === payment.id}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          <FiTrash2 /> {deletingId === payment.id ? 'Deleting...' : 'Delete'}
                        </button>
                        {payment.status === 'rejected' && payment.reject_reason && (
                          <span className="text-red-400 text-sm">Reason: {payment.reject_reason}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {currentPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {filterStatus === 'verified' && payments.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Reject Reason Modal */}
      {showRejectReason && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject Payment</h2>
            <textarea
              className="w-full p-2 rounded mb-4 bg-gray-700 text-white"
              rows={3}
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowRejectReason(null); setRejectReason(''); }}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectReason, payments.find(p => p.id === showRejectReason).type)}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {selectedPayment.id}</p>
              <p><strong>User ID:</strong> {selectedPayment.user_id}</p>
              <p><strong>Display Name:</strong> {selectedPayment.user_display_name || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedPayment.user_email}</p>
              <p><strong>Type:</strong> {selectedPayment.type === 'ceo_gas_fee' ? 'CEO Gas Fee' : 'Beneficiary Gas Fee'}</p>
              <p><strong>Amount:</strong> {selectedPayment.amount} USDT</p>
              <p><strong>Beneficiary Count:</strong> {selectedPayment.type === 'beneficiary_gas_fee' ? (selectedPayment.beneficiary_count || 0) : 'N/A'}</p>
              <p><strong>Transaction Hash:</strong> {selectedPayment.transaction_hash || 'N/A'}</p>
              <p><strong>Receipt:</strong> 
                {selectedPayment.receipt_url ? (
                  <a href={selectedPayment.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    View Receipt
                  </a>
                ) : 'N/A'}
              </p>
              <p><strong>Status:</strong> {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}</p>
              {selectedPayment.reject_reason && (
                <p><strong>Reject Reason:</strong> {selectedPayment.reject_reason}</p>
              )}
              <p><strong>Created At:</strong> {new Date(selectedPayment.created_at).toLocaleString('en-US', { timeZone: 'Africa/Lagos' })}</p>
              <p><strong>Updated At:</strong> {selectedPayment.updated_at ? new Date(selectedPayment.updated_at).toLocaleString('en-US', { timeZone: 'Africa/Lagos' }) : 'N/A'}</p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications and Analytics */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => {
            setNotificationText("");
            setEditId(null);
            setShowNotificationModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          <FiPlus /> Create Notification
        </button>
      </div>

      <motion.div className="bg-gray-800/30 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FiUser /> State-wise Beneficiaries
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stateAnalytics}>
            <XAxis dataKey="state" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Bar dataKey="beneficiaries" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div className="bg-gray-800/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">All Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-400">No notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="bg-gray-700 p-4 rounded flex justify-between items-center"
              >
                <span>{n.message}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(n)}
                    className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Notification" : "Create Notification"}
            </h2>
            <textarea
              className="w-full p-2 rounded mb-4 bg-gray-700 text-white"
              rows={4}
              placeholder="Type your notification..."
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                  setEditId(null);
                }}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={saveNotification}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                {editId ? "Update" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;