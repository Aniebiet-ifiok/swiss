import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { FiUser, FiCalendar, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
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

  // Fetch counts and analytics
  useEffect(() => {
    const fetchData = async () => {
      const { count: ceoTotal, error: ceoError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("role", "ceo");
      if (!ceoError) setCeoCount(ceoTotal);

      const { count: benTotal, error: benError } = await supabase
        .from("beneficiaries")
        .select("*", { count: "exact" });
      if (!benError) setBeneficiaryCount(benTotal);

      const { data: analyticsData, error: analyticsError } = await supabase
        .from("beneficiaries")
        .select("state, id");
      if (!analyticsError && analyticsData) {
        const stateMap = {};
        analyticsData.forEach((b) => {
          stateMap[b.state] = (stateMap[b.state] || 0) + 1;
        });
        setStateAnalytics(
          Object.keys(stateMap).map((state) => ({
            state,
            beneficiaries: stateMap[state],
          }))
        );
      }
    };

    fetchData();
  }, []);

  // Fetch disbursement date from settings
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

  // Countdown timer
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

  // Fetch all notifications
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

  // Update disbursement date
  const updateDisbursementDate = async (newDate) => {
    const { error } = await supabase
      .from("settings")
      .update({ disbursement_date: newDate })
      .eq("id", 1);

    if (error) {
      console.error("Failed to update payout date:", error.message);
      toast.error(`Failed to update payout date: ${error.message}`);
    } else {
      toast.success("Disbursement date updated successfully!");
      setRoundStart(new Date(newDate));
    }
  };

  // Create or edit notification
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

  // Delete notification
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

  // Open modal for edit
  const openEditModal = (notification) => {
    setNotificationText(notification.message);
    setEditId(notification.id);
    setShowNotificationModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>

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

      {/* Actions */}
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

      {/* State Analytics */}
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

      {/* Notifications List */}
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

      {/* Notification Modal */}
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
