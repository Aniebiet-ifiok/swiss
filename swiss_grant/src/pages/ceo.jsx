import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import binance from "../assets/binance.jpeg";
import bybit from "../assets/bybit.png";
import bitget from "../assets/bitget.png";
import {
  Home,
  Users,
  Bell,
  Menu,
  X,
  BarChart2,
  PlusSquare,
  Clock,
  DollarSign,
  Bitcoin,
  Wallet,
  Send,
  Building2,
  Network,
  CheckCircle,
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

/* --- Credentials Modal Inline --- */
function CredentialsModal({ open, onClose, user }) {
  const [credentials, setCredentials] = useState({
    ngo_name: "",
    ceo_name: "",
    phone: "",
    country: "",
    state: "",
    lga: "",
    home_address: "",
    cacFile: null,
    pictureFile: null,
    nin: "",
  });
  const [userCredentials, setUserCredentials] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchCredentials = async () => {
      const { data, error } = await supabase
        .from("credentials")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) return;
      setUserCredentials(data);
      setCredentials({
        ngo_name: data.ngo_name || "",
        ceo_name: data.ceo_name || "",
        phone: data.phone || "",
        country: data.country || "",
        state: data.state || "",
        lga: data.lga || "",
        home_address: data.home_address || "",
        nin: data.nin || "",
        cacFile: null,
        pictureFile: null,
      });
    };
    fetchCredentials();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let pictureUrl = userCredentials?.picture_url || null;
      let cacUrl = userCredentials?.cac_url || null;

      // Upload profile picture
      if (credentials.pictureFile) {
        const file = credentials.pictureFile;
        const fileName = `pictures${user.id}-${Date.now()}.${file.name
          .split(".")
          .pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("pictures")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("pictures")
          .getPublicUrl(fileName);
        pictureUrl = data.publicUrl;
      }

      // Upload CAC image
      if (credentials.cacFile) {
        const file = credentials.cacFile;
        const fileName = `cac-${user.id}-${Date.now()}.${file.name
          .split(".")
          .pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("pictures")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("pictures")
          .getPublicUrl(fileName);
        cacUrl = data.publicUrl;
      }

      // Clean up payload: only send DB fields (not File objects)
      const upsertPayload = {
        user_id: user.id,
        ngo_name: credentials.ngo_name,
        ceo_name: credentials.ceo_name,
        phone: credentials.phone,
        country: credentials.country,
        state: credentials.state,
        lga: credentials.lga,
        home_address: credentials.home_address,
        nin: credentials.nin,
        picture_url: pictureUrl,
        cac_url: cacUrl,
      };

      const { error } = await supabase
        .from("credentials")
        .upsert([upsertPayload]);
      if (error) throw error;

      toast.success("Credentials saved!");
      setUserCredentials({
        ...credentials,
        picture_url: pictureUrl,
        cac_url: cacUrl,
      });
      onClose();
    } catch (err) {
      console.error("Supabase error:", err);
      toast.error(
        "Failed to save credentials: " + (err.message || JSON.stringify(err))
      );
    }
  };

  if (!open || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900 text-gray-100 rounded-2xl shadow-2xl w-full max-w-xl p-8 space-y-6 overflow-y-auto max-h-[90vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-3">
          {userCredentials ? "Your Credentials" : "Upload Credentials"}
        </h2>

        {userCredentials ? (
          <div className="space-y-4">
            {userCredentials.picture_url && (
              <img
                src={userCredentials.picture_url}
                alt="Profile"
                className="w-32 h-32 rounded-lg"
              />
            )}
            {userCredentials.cac_url && (
              <img
                src={userCredentials.cac_url}
                alt="CAC"
                className="w-32 h-32 rounded-lg"
              />
            )}
            <div>
              <span className="font-medium">NGO / Cooperative Name: </span>
              {userCredentials.ngo_name}
            </div>
            <div>
              <span className="font-medium">CEO Name: </span>
              {userCredentials.ceo_name}
            </div>
            <div>
              <span className="font-medium">Phone: </span>
              {userCredentials.phone}
            </div>
            <div>
              <span className="font-medium">Country: </span>
              {userCredentials.country}
            </div>
            <div>
              <span className="font-medium">State: </span>
              {userCredentials.state}
            </div>
            <div>
              <span className="font-medium">LGA: </span>
              {userCredentials.lga}
            </div>
            <div>
              <span className="font-medium">Address: </span>
              {userCredentials.home_address}
            </div>
            <div>
              <span className="font-medium">NIN: </span>
              {userCredentials.nin || "N/A"}
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                NGO / Cooperative Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={credentials.ngo_name}
                onChange={(e) =>
                  setCredentials({ ...credentials, ngo_name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEO Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={credentials.ceo_name}
                onChange={(e) =>
                  setCredentials({ ...credentials, ceo_name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={credentials.phone}
                onChange={(e) =>
                  setCredentials({ ...credentials, phone: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={credentials.country}
                onChange={(e) =>
                  setCredentials({ ...credentials, country: e.target.value })
                }
                required
              >
                <option value="">Select Country</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={credentials.state}
                onChange={(e) =>
                  setCredentials({ ...credentials, state: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Local Government
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={credentials.lga}
                onChange={(e) =>
                  setCredentials({ ...credentials, lga: e.target.value })
                }
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Home Address
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={credentials.home_address}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    home_address: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIN</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={credentials.nin}
                onChange={(e) =>
                  setCredentials({ ...credentials, nin: e.target.value })
                }
              />
            </div>
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    pictureFile: e.target.files[0],
                  })
                }
                required
              />
            </div>
            {/* CAC */}
            <div>
              <label className="block text-sm font-medium mb-1">CAC</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCredentials({ ...credentials, cacFile: e.target.files[0] })
                }
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
/* --- End Credentials Modal Inline --- */

export default function UserDashboard() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [user, setUser] = useState(null);
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
  const [showGrantInUSDT, setShowGrantInUSDT] = useState(true);
  const [showGasInUSDT, setShowGasInUSDT] = useState(true);
  const ITEMS_PER_PAGE = 5; // show 5 beneficiaries per page
  const [openCredentialsModal, setOpenCredentialsModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const navigate = useNavigate();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [destinationType, setDestinationType] = useState("Wallet");
  const [network, setNetwork] = useState("ERC20");
  const [selectedExchange, setSelectedExchange] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Exchange options with logo URLs
  const exchangeOptions = [
    { name: "Binance", logo: binance },
    { name: "Bybit", logo: bybit },
    { name: "Bitget", logo: bitget },
  ];

  // Network options based on currency
  const networkOptions = {
    USDT: ["ERC20", "TRC20", "BEP20", "Solana"],
    BTC: ["Bitcoin", "Lightning"],
  };

  // Format disbursement date
  const formattedDisbursementDate = disbursementDate
    ? new Date(disbursementDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "the next scheduled disbursement";

  // Updated handleWithdraw
  const handleWithdraw = ({ currency, destinationType, network, exchange }) => {
    console.log(
      `Withdrawing ${withdrawAmount} ${currency} to ${destinationType}${
        exchange ? ` (${exchange})` : ""
      } address: ${walletAddress} on ${network || "N/A"} network`
    );
    toast.success(
      `Withdrawal request for ${withdrawAmount} ${currency} to ${
        destinationType === "Exchange" && exchange
          ? `${exchange} (${destinationType})`
          : destinationType
      } submitted!`
    );
    setIsSubmitted(true); // Show confirmation screen
    setWithdrawAmount("");
    setWalletAddress("");
    setSelectedExchange("");
    setNetwork(networkOptions[currency][0]);
  };

  // Handle form submission with validation
  const onSubmit = (e) => {
    e.preventDefault();
    if (!withdrawAmount || !walletAddress || !currency || !destinationType) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (withdrawAmount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }
    if (destinationType === "On-Chain" && !network) {
      toast.error("Please select a network for on-chain withdrawal.");
      return;
    }
    if (destinationType === "Exchange" && !selectedExchange) {
      toast.error("Please select an exchange.");
      return;
    }
    handleWithdraw({
      currency,
      destinationType,
      network,
      exchange: selectedExchange,
    });
  };

  // Function to handle gas fee deposit
  const handleGasFeeDeposit = () => {
    navigate("/payment"); // Navigate to payment page for gas fee deposit
  };

  // Function to handle payment trigger (for disbursement)
  const handlePaymentTrigger = () => {
    navigate("/payment"); // Navigate to payment page for disbursement
  };

  useEffect(() => {
    async function fetchBeneficiaries() {
      try {
        const { data, error } = await supabase
          .from("beneficiaries")
          .select("*");
        if (error) throw error;
        setBeneficiaries(
          data.map((b) => ({
            ...b,
            verifiedPayment: b.paymentConfirmed ? "Yes" : "No",
          }))
        );
      } catch (err) {
        console.error(err.message);
        setBeneficiaries([
          {
            userID: "1",
            fullName: "John Doe",
            email: "john@example.com",
            phone: "08012345678",
            state: "Lagos",
            verifiedPayment: "Yes",
          },
          {
            userID: "2",
            fullName: "Jane Smith",
            email: "jane@example.com",
            phone: "08087654321",
            state: "Abuja",
            verifiedPayment: "No",
          },
          {
            userID: "3",
            fullName: "Alice Johnson",
            email: "alice@example.com",
            phone: "08011223344",
            state: "Rivers",
            verifiedPayment: "Yes",
          },
          {
            userID: "4",
            fullName: "Bob Brown",
            email: "bob@example.com",
            phone: "08055667788",
            state: "Kano",
            verifiedPayment: "No",
          },
          {
            userID: "5",
            fullName: "Emma White",
            email: "emma@example.com",
            phone: "08099887766",
            state: "Kaduna",
            verifiedPayment: "Yes",
          },
          {
            userID: "6",
            fullName: "Tom Black",
            email: "tom@example.com",
            phone: "08044332211",
            state: "Oyo",
            verifiedPayment: "No",
          },
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

  // Fetch user info from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        toast.error("Error fetching user");
        console.error(error);
      } else {
        setUser(data.user);
      }
    };
    getUser();
  }, []);

  // Fetch dashboard data
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

  // Countdown timer
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

  // TRC20 Payment
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

  // Submit beneficiaries
  const handleSubmitBeneficiaries = async () => {
    if (!paymentConfirmed) return toast.error("Please complete payment first");

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
      { full_name: "", phone: "", state: "", city: "", zipcode: "" },
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
              <div className="flex items-center gap-3 flex-col justify-center">
                {/* Profile / Initials */}
                <div
                  className="relative w-28 h-28 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-pointer overflow-hidden shadow-lg"
                  onClick={() =>
                    document.getElementById("profilePicInput").click()
                  }
                >
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-[3.4rem]">
                      {user?.user_metadata?.full_name
                        ? user.user_metadata.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </span>
                  )}

                  {/* Hidden file input */}
                  <input
                    id="profilePicInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const fileExt = file.name.split(".").pop();
                      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                      const filePath = `pictures/${fileName}`;

                      try {
                        const { error: uploadError } = await supabase.storage
                          .from("pictures")
                          .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { data } = supabase.storage
                          .from("pictures")
                          .getPublicUrl(filePath);

                        const publicUrl = data.publicUrl;

                        const { error: updateError } =
                          await supabase.auth.updateUser({
                            data: { avatar_url: publicUrl },
                          });

                        if (updateError) throw updateError;

                        setUser({
                          ...user,
                          user_metadata: {
                            ...user.user_metadata,
                            avatar_url: publicUrl,
                          },
                        });

                        toast.success("Profile picture updated!");
                      } catch (err) {
                        console.error("Error uploading profile pic:", err);
                        toast.error("Failed to upload profile picture.");
                      }
                    }}
                  />
                </div>

                <h1 className="text-xl font-bold mt-2">
                  {user?.user_metadata?.full_name || "User Dashboard"}
                </h1>

                <div className="flex flex-col items-center space-y-1">
                  {user?.user_metadata?.full_name && (
                    <span className="text-gray-300 text-sm">
                      @
                      {user.user_metadata.full_name
                        .toLowerCase()
                        .replace(/\s+/g, "")}
                    </span>
                  )}
                </div>

                <button
                  className="lg:hidden mt-2"
                  onClick={() => setSidebarOpen(false)}
                >
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
                <button
                  onClick={() => setOpenCredentialsModal(true)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition w-full"
                >
                  <BarChart2 size={20} /> Credentials
                </button>

                <button
                  className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  <DollarSign /> Withdraw
                </button>
              </nav>
            </div>
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

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative bg-gray-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl max-w-lg w-full text-white"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowWithdrawModal(false);
                  setIsSubmitted(false);
                }}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition-all"
              >
                <X size={18} />
              </motion.button>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center space-y-6"
                >
                  <CheckCircle size={48} className="mx-auto text-cyan-400" />
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    Withdrawal Request Submitted
                  </h2>
                  <p className="text-gray-200">
                    Your withdrawal of {withdrawAmount} {currency} to{" "}
                    {destinationType === "Exchange" && selectedExchange
                      ? `${selectedExchange} (${destinationType})`
                      : destinationType}{" "}
                    has been successfully submitted. It will be processed on{" "}
                    {formattedDisbursementDate}.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setIsSubmitted(false);
                    }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white p-3 rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    Close
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
                    Withdraw Funds
                  </h2>

                  {/* Form */}
                  <form onSubmit={onSubmit} className="space-y-6">
                    {/* Currency Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-200 flex items-center gap-2">
                        <DollarSign size={16} className="text-cyan-400" />
                        Currency
                      </label>
                      <motion.select
                        value={currency}
                        onChange={(e) => {
                          setCurrency(e.target.value);
                          setNetwork(networkOptions[e.target.value][0]);
                          setSelectedExchange("");
                        }}
                        className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                        whileFocus={{ scale: 1.02 }}
                      >
                        <option value="USDT">USDT</option>
                        <option value="BTC">BTC</option>
                      </motion.select>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-200 flex items-center gap-2">
                        {currency === "BTC" ? (
                          <Bitcoin size={16} className="text-cyan-400" />
                        ) : (
                          <DollarSign size={16} className="text-cyan-400" />
                        )}
                        Amount ({currency})
                      </label>
                      <motion.input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder={`Enter amount in ${currency}`}
                        className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                        whileFocus={{ scale: 1.02 }}
                        min="0"
                        step={currency === "BTC" ? "0.00000001" : "0.01"}
                      />
                    </div>

                    {/* Destination Type */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-200 flex items-center gap-2">
                        <Building2 size={16} className="text-cyan-400" />
                        Destination
                      </label>
                      <motion.select
                        value={destinationType}
                        onChange={(e) => {
                          setDestinationType(e.target.value);
                          setSelectedExchange("");
                        }}
                        className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                        whileFocus={{ scale: 1.02 }}
                      >
                        <option value="Wallet">Wallet</option>
                        <option value="Exchange">Exchange</option>
                        <option value="On-Chain">On-Chain</option>
                      </motion.select>
                    </div>

                    {/* Exchange Selection (for Exchange destination) */}
                    {destinationType === "Exchange" && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-200 flex items-center gap-2">
                          <Building2 size={16} className="text-cyan-400" />
                          Exchange
                        </label>
                        <div className="flex items-center gap-3">
                          <motion.select
                            value={selectedExchange}
                            onChange={(e) =>
                              setSelectedExchange(e.target.value)
                            }
                            className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                            whileFocus={{ scale: 1.02 }}
                          >
                            <option value="">Select an exchange</option>
                            {exchangeOptions.map((exchange) => (
                              <option key={exchange.name} value={exchange.name}>
                                {exchange.name}
                              </option>
                            ))}
                          </motion.select>
                          {selectedExchange && (
                            <motion.img
                              src={
                                exchangeOptions.find(
                                  (ex) => ex.name === selectedExchange
                                )?.logo
                              }
                              alt={`${selectedExchange} logo`}
                              className="h-8 w-8 object-contain"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Network Selection (for On-Chain only) */}
                    {destinationType === "On-Chain" && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-200 flex items-center gap-2">
                          <Network size={16} className="text-cyan-400" />
                          Network
                        </label>
                        <motion.select
                          value={network}
                          onChange={(e) => setNetwork(e.target.value)}
                          className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                          whileFocus={{ scale: 1.02 }}
                        >
                          <option value="">Select a network</option>
                          {networkOptions[currency].map((net) => (
                            <option key={net} value={net}>
                              {net}
                            </option>
                          ))}
                        </motion.select>
                      </div>
                    )}

                    {/* Wallet Address Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-200 flex items-center gap-2">
                        <Wallet size={16} className="text-cyan-400" />
                        {destinationType === "Exchange"
                          ? "Exchange Address"
                          : "Wallet Address"}
                      </label>
                      <motion.input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder={`Enter ${destinationType.toLowerCase()} address`}
                        className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={
                        !withdrawAmount ||
                        !walletAddress ||
                        (destinationType === "On-Chain" && !network) ||
                        (destinationType === "Exchange" && !selectedExchange)
                      }
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white p-3 rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      <Send size={16} />
                      Withdraw
                    </motion.button>
                  </form>

                  {/* Footer Note */}
                  <p className="text-gray-400 text-xs mt-4 text-center">
                    Ensure the {destinationType.toLowerCase()} address is
                    correct. Withdrawals are processed on the{" "}
                    <span className="text-cyan-400">
                      {destinationType === "Exchange" && selectedExchange
                        ? selectedExchange
                        : network || currency}
                    </span>{" "}
                    network.
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl w-[90%] max-w-lg text-center text-white border border-cyan-500/30">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition"
            >
              <X size={22} />
            </button>

            {/* Modal Content */}
            <h2 className="text-xl font-bold uppercase mb-4 text-cyan-400">
              ⚠️ Important Notice
            </h2>
            <p className="text-lg uppercase text-gray-200 leading-relaxed">
              Make sure that the <span className="text-cyan-400">network</span>{" "}
              or <span className="text-cyan-400">chain type</span> you&apos;re
              depositing to is <span className="font-semibold">ERC20</span>.
            </p>

            {/* Action Button */}
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium shadow-md transition"
            >
              Got it ✅
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 z-10 relative">
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

        <main className="p-6 space-y-8 bg-gray-900 min-h-screen">
          {/* Top Cards - 2 Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Row 1 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 15px rgba(34, 211, 238, 0.5)",
              }}
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-br from-blue-950 to-indigo-950 p-4 rounded-2xl shadow-lg 
                 backdrop-blur-lg hover:shadow-cyan-500/50 transition-all relative cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <p className="text-gray-300 text-xs font-medium uppercase tracking-widest">
                  Gas Fee (CEO)
                </p>
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <h2 className="text-lg font-semibold text-white">
                  <span className="flex items-center">
                    <DollarSign size={14} className="text-cyan-400 mr-1" />
                    6.70
                  </span>
                </h2>
              </div>

              <p className="text-gray-300 text-xs font-medium mt-2 uppercase tracking-widest">
                Gas Fee (Beneficiary)
              </p>
              <h3 className="text-base font-semibold text-white flex items-center">
                <DollarSign size={12} className="text-cyan-400 mr-1" />
                3.34
              </h3>
            </motion.div>

            {/* Deposit Gas Fee Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)",
              }}
              className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 rounded-2xl shadow-lg backdrop-blur-lg hover:shadow-emerald-400/50 transition-all flex flex-col justify-center items-center"
            >
              <Wallet size={20} className="text-white mb-2" />
              <p className="text-white text-xs font-medium uppercase tracking-widest mb-2">
                Deposit Gas Fee
              </p>
              <button
                onClick={handleGasFeeDeposit}
                className="px-4 py-2 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Deposit Now
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 15px rgba(34, 211, 238, 0.5)",
              }}
              className="bg-gradient-to-br from-blue-950 to-indigo-950 p-4 rounded-2xl shadow-lg backdrop-blur-lg hover:shadow-cyan-500/50 transition-all"
            >
              <div className="flex items-center space-x-2">
                <p className="text-gray-300 text-xs font-medium uppercase tracking-widest">
                  Grant
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <h2 className="text-lg font-semibold text-white">
                  {showGrantInUSDT ? (
                    <span className="flex items-center">
                      <Bitcoin size={14} className="text-cyan-400 mr-1" />
                      {(beneficiaryCount * 0.14).toFixed(4)} BTC
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <DollarSign size={14} className="text-cyan-400 mr-1" />
                      {(beneficiaryCount * 100).toLocaleString()}
                    </span>
                  )}
                </h2>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrantInUSDT}
                    onChange={() => setShowGrantInUSDT(!showGrantInUSDT)}
                    className="sr-only"
                  />
                  <div className="w-10 h-5 bg-indigo-500 rounded-full shadow-inner relative">
                    <div
                      className={`dot absolute w-5 h-5 bg-white rounded-full shadow -left-0.9 top-0.7 transition-transform duration-300 ease-in-out ${
                        showGrantInUSDT ? "translate-x-full" : ""
                      }`}
                    />
                  </div>
                </label>
              </div>
              <p className="text-gray-300 text-xs font-medium mt-2 uppercase tracking-widest">
                Commission
              </p>
              <h3 className="text-base font-semibold text-white flex items-center">
                <Bitcoin size={12} className="text-cyan-400 mr-1" />
                {(beneficiaryCount * 0.00056).toFixed(6)} BTC
              </h3>
            </motion.div>

            {/* Row 2 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 15px rgba(34, 211, 238, 0.5)",
              }}
              className="bg-gradient-to-br from-blue-950 to-indigo-950 p-4 rounded-2xl shadow-lg backdrop-blur-lg hover:shadow-cyan-500/50 transition-all"
            >
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-cyan-400" />
                <p className="text-gray-300 text-xs font-medium uppercase tracking-widest">
                  Beneficiaries
                </p>
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">
                {beneficiaryCount}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 15px rgba(34, 211, 238, 0.5)",
              }}
              className="bg-gradient-to-br from-blue-950 to-indigo-950 p-4 rounded-2xl shadow-lg backdrop-blur-lg hover:shadow-cyan-500/50 transition-all"
            >
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-cyan-400" />
                <p className="text-gray-300 text-xs font-medium uppercase tracking-widest">
                  Next Payout
                </p>
              </div>
              {disbursementDate ? (
                <h2 className="text-lg font-semibold text-white mt-2">
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                </h2>
              ) : (
                <p className="text-gray-400 text-sm mt-2">No date set</p>
              )}
            </motion.div>
          </div>

          {/* Analytics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/40 backdrop-blur-lg !mt-6 p-6 rounded-3xl shadow-2xl space-y-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Analytics Dashboard
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* State-wise Bar Chart */}
              <div className="bg-gray-900/40 p-4 rounded-3xl shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-3">
                  State-wise Beneficiaries
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={
                      stateAnalytics.length
                        ? stateAnalytics
                        : dummyStateAnalytics
                    }
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="state"
                      stroke="#fff"
                      tick={{ fill: "#fff", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#fff"
                      tick={{ fill: "#fff", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey="beneficiaries"
                      radius={[8, 8, 0, 0]}
                      barSize={28}
                    >
                      {(stateAnalytics.length
                        ? stateAnalytics
                        : dummyStateAnalytics
                      ).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index % 2 === 0 ? "#facc15" : "#3b82f6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Pie Chart - Distribution */}
              <div className="bg-gray-900/40 p-4 rounded-3xl shadow-xl backdrop-blur-md flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Beneficiaries Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={
                        stateAnalytics.length
                          ? stateAnalytics
                          : dummyStateAnalytics
                      }
                      dataKey="beneficiaries"
                      nameKey="state"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#10b981"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {(stateAnalytics.length
                        ? stateAnalytics
                        : dummyStateAnalytics
                      ).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index % 2 === 0 ? "#facc15" : "#3b82f6"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Line Chart - Monthly Trend */}
              <div className="bg-gray-900/40 p-4 rounded-3xl shadow-xl backdrop-blur-md col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Monthly Beneficiary Growth
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={
                      stateAnalytics.length
                        ? stateAnalytics.map((s, i) => ({
                            month: `Month ${i + 1}`,
                            beneficiaries: s.beneficiaries,
                          }))
                        : dummyMonthlyGrowth
                    }
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="month"
                      stroke="#fff"
                      tick={{ fill: "#fff", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#fff"
                      tick={{ fill: "#fff", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                      }}
                    />
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

          {/* Beneficiaries Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-3xl shadow-2xl mt-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Beneficiaries List
            </h2>
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
                      <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                        {b.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                        {b.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                        {b.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                        {b.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                        {b.verifiedPayment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:bg-gray-600"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-gray-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
                Payment of a gas fee (3.2 USDT per beneficiary) is mandatory for
                verification before registration.
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
                    <input
                      type="text"
                      placeholder="Zip Code"
                      name="zipcode"
                      value={b.zipcode}
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

      {/* Credentials Modal */}
      <CredentialsModal
        open={openCredentialsModal}
        onClose={() => setOpenCredentialsModal(false)}
        user={user}
      />
    </div>
  );
}
