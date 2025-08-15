// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Bell,
  Menu,
  X,
  BarChart2,
  PlusSquare,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import { supabase } from "../supabase";
import toast from "react-hot-toast";


export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ceoCount, setCeoCount] = useState(0);
  const [beneficiaryCount, setBeneficiaryCount] = useState(0);
  const [stateAnalytics, setStateAnalytics] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [disbursementDate, setDisbursementDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [addBeneficiaryOpen, setAddBeneficiaryOpen] = useState(false);

  const [beneficiariesList, setBeneficiariesList] = useState([]);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const USDT_TRON_WALLET = "TXXXXXXXXXXXX"; // replace with your wallet address

const ITEMS_PER_PAGE = 5; // show 5 beneficiaries per page

// ---------- Inside your component ----------
const [currentPage, setCurrentPage] = useState(1);
  const [beneficiaries, setBeneficiaries] = useState([]);

 useEffect(() => {
    async function fetchBeneficiaries() {
      try {
        const { data, error } = await supabase.from("beneficiaries").select("*");
        if (error) throw error;
        setBeneficiaries(
          data.map((b) => ({
            ...b,
            verifiedPayment: b.paymentConfirmed ? "Yes" : "No", // Assuming your table has a boolean `paymentConfirmed`
          }))
        );
      } catch (err) {
        console.error(err.message);
        // fallback dummy data
        setBeneficiaries([
          { userID: "1", fullName: "John Doe", email: "john@example.com", phone: "08012345678", state: "Lagos", verifiedPayment: "Yes" },
          { userID: "2", fullName: "Jane Smith", email: "jane@example.com", phone: "08087654321", state: "Abuja", verifiedPayment: "No" },
          { userID: "3", fullName: "Alice Johnson", email: "alice@example.com", phone: "08011223344", state: "Rivers", verifiedPayment: "Yes" },
          { userID: "4", fullName: "Bob Brown", email: "bob@example.com", phone: "08055667788", state: "Kano", verifiedPayment: "No" },
          { userID: "5", fullName: "Emma White", email: "emma@example.com", phone: "08099887766", state: "Kaduna", verifiedPayment: "Yes" },
          { userID: "6", fullName: "Tom Black", email: "tom@example.com", phone: "08044332211", state: "Oyo", verifiedPayment: "No" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchBeneficiaries();
  }, []);

// Calculate pagination
const totalPages = Math.ceil(beneficiaries.length / ITEMS_PER_PAGE);
const currentItems = beneficiaries.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

  // Dummy data
const dummyStateAnalytics = [
  { state: "Lagos", beneficiaries: 120 },
  { state: "Abuja", beneficiaries: 80 },
  { state: "Kano", beneficiaries: 60 },
  { state: "Rivers", beneficiaries: 40 },
  { state: "Oyo", beneficiaries: 30 },
];

const dummyMonthlyGrowth = [
  { month: "Jan", beneficiaries: 50 },
  { month: "Feb", beneficiaries: 70 },
  { month: "Mar", beneficiaries: 90 },
  { month: "Apr", beneficiaries: 110 },
  { month: "May", beneficiaries: 130 },
  { month: "Jun", beneficiaries: 150 },
];

  // ---------- Fetch data ----------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { count: ceoTotal } = await supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("role", "ceo");

        const { count: benTotal, data: analyticsData } = await supabase
          .from("beneficiaries")
          .select("state, id", { count: "exact" });

        const stateMap = {};
        analyticsData?.forEach((b) => {
          stateMap[b.state] = (stateMap[b.state] || 0) + 1;
        });
        const chartData = Object.keys(stateMap).map((state) => ({
          state,
          beneficiaries: stateMap[state],
        }));

        const { data: notificationsData } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: settingsData } = await supabase
          .from("settings")
          .select("disbursement_date")
          .single();

        setCeoCount(ceoTotal || 0);
        setBeneficiaryCount(benTotal || 0);
        setStateAnalytics(chartData || []);
        setNotifications(notificationsData || []);
        setDisbursementDate(settingsData?.disbursement_date || null);

        if (notificationsData?.length > 0) setHasNewNotifications(true);
      } catch (error) {
        toast.error("Failed to load dashboard data");
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // ---------- Countdown timer ----------
  useEffect(() => {
    if (!disbursementDate) return;
    const interval = setInterval(() => {
      const deadline = new Date(disbursementDate);
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
  }, [disbursementDate]);

  // ---------- TRC20 Payment ----------
  const totalAmount = beneficiariesList.length * 3.2;

  const handleTRC20Payment = async () => {
    try {
      const tronWeb = window.tronWeb;
      if (!tronWeb) return alert("Install TronLink wallet");

      const transaction = await tronWeb.transactionBuilder.sendTrx(
        USDT_TRON_WALLET,
        tronWeb.toSun(totalAmount),
        tronWeb.defaultAddress.base58
      );

      const signedTxn = await tronWeb.trx.sign(transaction);
      const receipt = await tronWeb.trx.sendRawTransaction(signedTxn);

      if (receipt.result) {
        toast.success("Payment successful!");
        setPaymentConfirmed(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment failed");
    }
  };

  // ---------- Submit beneficiaries ----------
  const handleSubmitBeneficiaries = async () => {
    if (!paymentConfirmed)
      return toast.error("Please complete payment first");

    try {
      const { error } = await supabase
        .from("beneficiaries")
        .insert(beneficiariesList);
      if (error) throw error;

      toast.success("Beneficiaries added successfully");
      setAddBeneficiaryOpen(false);
      setBeneficiariesList([]);
      setPaymentConfirmed(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add beneficiaries");
    }
  };

  const handleBeneficiaryChange = (index, e) => {
    const { name, value } = e.target;
    setBeneficiariesList((prev) => {
      const newList = [...prev];
      newList[index][name] = value;
      return newList;
    });
  };

  const addBeneficiaryRow = () => {
    setBeneficiariesList((prev) => [
      ...prev,
      { full_name: "", phone: "", state: "", city: "" },
    ]);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) setHasNewNotifications(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
   {/* Sidebar */}
<AnimatePresence>
  {(sidebarOpen || window.innerWidth >= 1024) && (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      exit={{ x: -250 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-indigo-800 to-purple-900/90 backdrop-blur-xl w-64 p-6 space-y-6 fixed inset-y-0 z-20 rounded-r-3xl shadow-2xl flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl mb-2 font-bold text-white">Swiss Grant</h2>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-3 mt-6">
          <a className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition">
            <Home size={20} /> Home
          </a>
          <a className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition">
            <Users size={20} /> Beneficiaries
          </a>
          <a className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition">
            <BarChart2 size={20} /> Analytics
          </a>
          <button
            onClick={() => {
              setAddBeneficiaryOpen(true);
              if (beneficiariesList.length === 0) addBeneficiaryRow();
            }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition w-full"
          >
            <PlusSquare size={20} /> Add Beneficiary
          </button>
        </nav>
      </div>

      {/* Premium Logout Button */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
        className="flex items-center justify-start gap-3 p-2 rounded-2xl border border-lg hover:scale-[1.1] cursor-pointer hover:to-red-800 shadow-lg text-white font-semibold transition-all duration-300"
      >
        <X size={20} className="text-white" />
        Logout
      </button>
    </motion.aside>
  )}
</AnimatePresence>



      {/* Main content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 z-10 relative">
        {/* Navbar */}
        <header className="bg-gray-800/30 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-10 rounded-b-3xl">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">CEO Dashboard</h1>

          <div className="relative">
            <button onClick={toggleNotifications}>
              <Bell size={24} />
            </button>

            {hasNewNotifications && !notificationsOpen && (
              <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-ping"></span>
            )}
          </div>
        </header>

        {/* Main Content */}
      <main className="p-6 space-y-8 bg-gray-900 min-h-screen">
  {/* Top Cards */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {loading
      ? [...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-700/30 h-32 rounded-3xl animate-pulse shadow-xl"
          />
        ))
      : (
        <>
       

          {/* Total Beneficiaries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-tr from-transparent-500 to-blue-900 p-6 rounded-3xl shadow-2xl backdrop-blur-md hover:shadow-3xl transition-transform flex flex-col justify-between"
          >
            <p className="text-gray-200 font-semibold uppercase text-sm tracking-wider">Total Beneficiaries</p>
            <h2 className="text-4xl font-extrabold text-white">{beneficiaryCount}</h2>
          </motion.div>

          {/* Next Payout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-tr from-transparent-500 to-blue-900 p-6 rounded-3xl shadow-2xl backdrop-blur-md hover:shadow-3xl transition-transform flex flex-col justify-between"
          >
            <p className="text-gray-200 font-semibold uppercase text-sm tracking-wider">Next Payout</p>
            {disbursementDate ? (
              <h2 className="text-2xl font-bold text-white">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </h2>
            ) : (
              <p className="text-gray-300">No date set</p>
            )}
          </motion.div>

          {/* Grant & Commission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-tr from-transparent-800 to-blue-900 p-6 rounded-3xl shadow-2xl backdrop-blur-md hover:shadow-3xl transition-transform flex flex-col justify-between"
          >
            <p className="text-gray-200 font-semibold uppercase text-sm tracking-wider">Your Grant</p>
            <h2 className="text-4xl font-extrabold text-white">
              ${ (beneficiaryCount * 100).toLocaleString() }
            </h2>
            <p className="text-gray-200 font-medium mt-2 uppercase text-sm tracking-wide">Commission Earned</p>
            <h3 className="text-2xl font-bold text-white">
              ${ (beneficiaryCount * 3.2).toFixed(2) }
            </h3>
          </motion.div>
        </>
      )}
  </div>

{/* ---------- Premium Analytics Dashboard ---------- */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-3xl shadow-2xl space-y-8"
>
  <h2 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h2>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* State-wise Bar Chart */}
    <div className="bg-gray-900/40 p-4 rounded-3xl shadow-xl backdrop-blur-md">
      <h3 className="text-lg font-semibold text-white mb-3">State-wise Beneficiaries</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={stateAnalytics.length ? stateAnalytics : dummyStateAnalytics}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="state" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
          <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "10px", border: "none", color: "#fff" }} />
          <Bar dataKey="beneficiaries" radius={[8, 8, 0, 0]} barSize={28}>
            {(stateAnalytics.length ? stateAnalytics : dummyStateAnalytics).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#facc15" : "#3b82f6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Pie Chart - Distribution */}
    <div className="bg-gray-900/40 p-4 rounded-3xl shadow-xl backdrop-blur-md flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold text-white mb-3">Beneficiaries Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={stateAnalytics.length ? stateAnalytics : dummyStateAnalytics}
            dataKey="beneficiaries"
            nameKey="state"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#10b981"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {(stateAnalytics.length ? stateAnalytics : dummyStateAnalytics).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#facc15" : "#3b82f6"} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "10px", border: "none", color: "#fff" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Line Chart - Monthly Trend */}
    <div className="bg-gray-900/40 p-4 rounded-3xl shadow-xl backdrop-blur-md col-span-1 lg:col-span-2">
      <h3 className="text-lg font-semibold text-white mb-3">Monthly Beneficiary Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={
            stateAnalytics.length
              ? stateAnalytics.map((s, i) => ({ month: `Month ${i + 1}`, beneficiaries: s.beneficiaries }))
              : dummyMonthlyGrowth
          }
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="month" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
          <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "10px", border: "none", color: "#fff" }} />
          <Line
            type="monotone"
            dataKey="beneficiaries"
            stroke="#facc15"
            strokeWidth={3}
            dot={{ r: 5, fill: "#3b82f6" }}
            activeDot={{ r: 7, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
</motion.div>




{/* // ---------- Table JSX ---------- */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-3xl shadow-2xl mt-8"
>
  <h2 className="text-2xl font-bold text-white mb-4">Beneficiaries List</h2>

  <div className="overflow-x-auto rounded-2xl">
    <table className="min-w-full divide-y divide-gray-700">
      <thead className="bg-gray-900/40">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            #
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Full Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Phone
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            State
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Verified Payment
          </th>
        </tr>
      </thead>
      <tbody className="bg-gray-800 divide-y divide-gray-700">
        {currentItems.map((b, index) => (
          <tr key={b.userID}>
            <td className="px-6 py-4 whitespace-nowrap text-gray-200">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-200">{b.fullName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-200">{b.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-200">{b.phone}</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-200">{b.state}</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-200">{b.verifiedPayment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination Controls */}
  <div className="flex justify-between items-center mt-4">
    <button
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:bg-gray-600"
      disabled={currentPage === 1}
    >
      Previous
    </button>
    <span className="text-gray-200">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:bg-gray-600"
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
</motion.div>


</main>

      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed right-0 top-0 h-full w-80 bg-gray-900/40 backdrop-blur-xl p-6 z-30 overflow-y-auto rounded-l-3xl shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Notifications</h2>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {loading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-gray-700/30 animate-pulse mb-4"
                  />
                ))
              : notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-4 rounded-3xl mb-4 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform backdrop-blur-md"
                  >
                    <p className="text-gray-100 font-medium">{n.message}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </motion.div>
                ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Beneficiary Modal */}
      <AnimatePresence>
        {addBeneficiaryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 p-6 rounded-3xl w-full max-w-2xl shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Add Beneficiaries</h2>
                <button
                  onClick={() => setAddBeneficiaryOpen(false)}
                  className="p-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-red-400 font-medium mb-4">
                Payment of the gas fee (3.2 USDT per beneficiary) is mandatory
                for verification before registration.
              </p>

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {beneficiariesList.map((b, i) => (
                  <div
                    key={i}
                    className="bg-gray-800/40 p-4 rounded-2xl space-y-2"
                  >
                    <input
                      type="text"
                      placeholder="Full Name"
                      name="full_name"
                      value={b.full_name}
                      onChange={(e) => handleBeneficiaryChange(i, e)}
                      className="w-full p-2 rounded-md bg-gray-700 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      name="phone"
                      value={b.phone}
                      onChange={(e) => handleBeneficiaryChange(i, e)}
                      className="w-full p-2 rounded-md bg-gray-700 text-white"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      name="state"
                      value={b.state}
                      onChange={(e) => handleBeneficiaryChange(i, e)}
                      className="w-full p-2 rounded-md bg-gray-700 text-white"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      name="city"
                      value={b.city}
                      onChange={(e) => handleBeneficiaryChange(i, e)}
                      className="w-full p-2 rounded-md bg-gray-700 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={addBeneficiaryRow}
                  className="px-4 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
                >
                  Add Another
                </button>

                <button
                  onClick={handleTRC20Payment}
                  className={`px-4 py-2 bg-green-500 rounded-xl hover:bg-green-600 transition ${
                    paymentConfirmed ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={paymentConfirmed}
                >
                  Pay {totalAmount.toFixed(2)} USDT
                </button>

                <button
                  onClick={handleSubmitBeneficiaries}
                  className="px-4 py-2 bg-pink-500 rounded-xl hover:bg-pink-600 transition"
                >
                  Submit Beneficiaries
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
