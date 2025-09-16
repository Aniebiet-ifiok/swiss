import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import binance from "../assets/binance.jpeg";
import bybit from "../assets/bybit.png";
import bitget from "../assets/bitget.png";
import {
  Home,
  Users,
  Bell,
  Menu,
  X,
  AlertCircle,
  Info,
  BarChart2,
  PlusSquare,
  Clock,
  DollarSign,
  Bitcoin,
  Wallet,
  RefreshCcw,
  Send,
  Building2,
  Network,
  CheckCircle,
  History,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
      if (error) {
        console.error("Error fetching credentials:", error);
        return;
      }
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

    // Validate required fields
    const requiredFields = [
      "ngo_name",
      "ceo_name",
      "phone",
      "country",
      "state",
      "lga",
      "home_address",
    ];
    for (const field of requiredFields) {
      if (!credentials[field] || credentials[field].trim() === "") {
        toast.error(`Please fill in the ${field.replace("_", " ")} field.`);
        return;
      }
    }

    // Validate file uploads if userCredentials is null (new submission)
    if (!userCredentials) {
      if (!credentials.pictureFile) {
        toast.error("Please upload a profile picture.");
        return;
      }
      if (!credentials.cacFile) {
        toast.error("Please upload a CAC document.");
        return;
      }
    }

    try {
      let pictureUrl = userCredentials?.picture_url || null;
      let cacUrl = userCredentials?.cac_url || null;

      // Upload picture file if provided
      if (credentials.pictureFile) {
        const file = credentials.pictureFile;
        const fileName = `pictures/${user.id}-${Date.now()}.${file.name
          .split(".")
          .pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("pictures")
          .upload(fileName, file);
        if (uploadError) {
          console.error("Picture upload error:", uploadError);
          throw new Error(`Failed to upload picture: ${uploadError.message}`);
        }
        const { data } = supabase.storage.from("pictures").getPublicUrl(fileName);
        pictureUrl = data.publicUrl;
      }

      // Upload CAC file if provided
      if (credentials.cacFile) {
        const file = credentials.cacFile;
        const fileName = `cac/${user.id}-${Date.now()}.${file.name
          .split(".")
          .pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("pictures")
          .upload(fileName, file);
        if (uploadError) {
          console.error("CAC upload error:", uploadError);
          throw new Error(`Failed to upload CAC: ${uploadError.message}`);
        }
        const { data } = supabase.storage.from("pictures").getPublicUrl(fileName);
        cacUrl = data.publicUrl;
      }

      // Prepare payload for upsert
      const upsertPayload = {
        user_id: user.id,
        ngo_name: credentials.ngo_name,
        ceo_name: credentials.ceo_name,
        phone: credentials.phone,
        country: credentials.country, // Fixed: Use credentials.country
        state: credentials.state,
        lga: credentials.lga,
        home_address: credentials.home_address,
        nin: credentials.nin || null, // Allow null for nin as it's not required
        picture_url: pictureUrl,
        cac_url: cacUrl,
      };

      console.log("Upsert payload:", upsertPayload); // Debug payload

      const { error } = await supabase.from("credentials").upsert([upsertPayload]);
      if (error) {
        console.error("Supabase upsert error:", error);
        throw error;
      }

      toast.success("Credentials saved successfully!");
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
          {userCredentials ? "Your Credentials/KYC" : "Upload Credentials/KYC"}
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
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="Algeria">Algeria</option>
                  <option value="Angola">Angola</option>
                  <option value="Benin">Benin</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Burkina Faso">Burkina Faso</option>
                  <option value="Burundi">Burundi</option>
                  <option value="Cabo Verde">Cabo Verde</option>
                  <option value="Cameroon">Cameroon</option>
                  <option value="Central African Republic">Central African Republic</option>
                  <option value="Chad">Chad</option>
                  <option value="Comoros">Comoros</option>
                  <option value="Congo (Brazzaville)">Congo (Brazzaville)</option>
                  <option value="Congo (Kinshasa)">Congo (Kinshasa)</option>
                  <option value="Djibouti">Djibouti</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Equatorial Guinea">Equatorial Guinea</option>
                  <option value="Eritrea">Eritrea</option>
                  <option value="Eswatini">Eswatini</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Gabon">Gabon</option>
                  <option value="Gambia">Gambia</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Guinea">Guinea</option>
                  <option value="Guinea-Bissau">Guinea-Bissau</option>
                  <option value="Ivory Coast">Ivory Coast</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Lesotho">Lesotho</option>
                  <option value="Liberia">Liberia</option>
                  <option value="Libya">Libya</option>
                  <option value="Madagascar">Madagascar</option>
                  <option value="Malawi">Malawi</option>
                  <option value="Mali">Mali</option>
                  <option value="Mauritania">Mauritania</option>
                  <option value="Mauritius">Mauritius</option>
                  <option value="Morocco">Morocco</option>
                  <option value="Mozambique">Mozambique</option>
                  <option value="Namibia">Namibia</option>
                  <option value="Niger">Niger</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                  <option value="Senegal">Senegal</option>
                  <option value="Seychelles">Seychelles</option>
                  <option value="Sierra Leone">Sierra Leone</option>
                  <option value="Somalia">Somalia</option>
                  <option value="South Africa">South Africa</option>
                  <option value="South Sudan">South Sudan</option>
                  <option value="Sudan">Sudan</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Togo">Togo</option>
                  <option value="Tunisia">Tunisia</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Zimbabwe">Zimbabwe</option>
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
                <label className="block text-sm font-medium mb-1">Local Government</label>
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
                <label className="block text-sm font-medium mb-1">Home Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={credentials.home_address}
                  onChange={(e) =>
                    setCredentials({ ...credentials, home_address: e.target.value })
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
              <div>
                <label className="block text-sm font-medium mb-1">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCredentials({ ...credentials, pictureFile: e.target.files[0] })
                  }
                  required={!userCredentials}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CAC</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCredentials({ ...credentials, cacFile: e.target.files[0] })
                  }
                  required={!userCredentials}
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
  const [gasFeeStatus, setGasFeeStatus] = useState({
    ceo: { deposited: false, verified: false },
  });
  const [totalGrant, setTotalGrant] = useState(0);
  const ITEMS_PER_PAGE = 5;
  const [openCredentialsModal, setOpenCredentialsModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [btcPrice, setBtcPrice] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showGrantInUSDT, setShowGrantInUSDT] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const navigate = useNavigate();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [destinationType, setDestinationType] = useState("Wallet");
  const [network, setNetwork] = useState("Aptos");
  const [selectedExchange, setSelectedExchange] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [delayPassed, setDelayPassed] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);

  /* Pagination logic for transactions */
  const itemsPerPage = 3;
  const [NewCurrentPage, setNewCurrentPage] = useState(1);
  const NewTotalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (NewCurrentPage - 1) * itemsPerPage;
  const paginatedTransactions = transactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const exchangeOptions = [
    { name: "Binance", logo: binance },
    { name: "Bybit", logo: bybit },
    { name: "Bitget", logo: bitget },
  ];

  const networkOptions = {
    USDT: ["Aptos", "TRC20", "BEP20", "Solana"],
    BTC: ["Bitcoin", "Lightning"],
  };

  const formattedDisbursementDate = disbursementDate
    ? new Date(disbursementDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "the next scheduled disbursement";

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
    setIsSubmitted(true);
    setWithdrawAmount("");
    setWalletAddress("");
    setSelectedExchange("");
    setNetwork(networkOptions[currency][0]);
  };

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

  const handleCeoGasFeeDeposit = async () => {
    try {
      navigate("/payment", {
        state: {
          userId: user?.id,
          totalAmount: 6.7,
          type: "ceo_gas_fee",
        },
      });
    } catch (err) {
      console.error("Gas fee deposit error:", err);
      toast.error("Failed to initiate CEO gas fee deposit.");
    }
  };

const sendConfirmationEmail = async (type, count) => {
  try {
    const message =
      type === 'ceo_gas_fee'
        ? 'Your CEO gas fee payment has been verified. You can now proceed with disbursements.'
        : `Your beneficiary gas fee payment for ${count} ${
            count === 1 ? 'beneficiary' : 'beneficiaries'
          } has been verified.`;
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        email: user.email,
        subject: type === 'ceo_gas_fee' ? 'Gas Fee Payment Verified' : 'Beneficiary Payment Verified',
        message,
      },
    });
    if (error) throw error;
    toast.success('Confirmation email sent!');
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    toast.error('Failed to send confirmation email.');
  }
};

  useEffect(() => {
    if (gasFeeStatus.ceo.verified) {
      sendConfirmationEmail();
    }
  }, [gasFeeStatus.ceo.verified]);

useEffect(() => {
  const fetchGasFeeStatus = async () => {
    if (!user) return;
   try {
  const [
    { data: ceoVerification, error: ceoError },
    { data: benVerification, error: benError },
  ] = await Promise.all([
    supabase
      .from("ceo_gas_fee_verifications")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["pending", "verified"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("beneficiary_gas_fee_verifications")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["pending", "verified"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  setGasFeeStatus({
    ceo: ceoVerification
      ? { deposited: true, verified: ceoVerification.status === "verified" }
      : { deposited: false, verified: false },
    beneficiaries: benVerification
      ? { deposited: true, verified: benVerification.status === "verified" }
      : { deposited: false, verified: false },
  });
} catch (err) {
  console.error("Error fetching payment status:", err);
  if (err.code !== "PGRST116") {
    toast.error("Failed to fetch gas fee status");
  } else {
    setGasFeeStatus({
      ceo: { deposited: false, verified: false },
      beneficiaries: { deposited: false, verified: false },
    });
  }
}
  };

  fetchGasFeeStatus();
  const interval = setInterval(fetchGasFeeStatus, 30000);
  return () => clearInterval(interval);
}, [user]);

  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch(
          "https://api.dexscreener.com/latest/dex/pairs/ethereum/0x9db9e0e53058c89e5b94e29621a205198648425b"
        );
        const data = await response.json();
        setBtcPrice(data.pair.priceUsd);
      } catch (error) {
        console.error("Error fetching BTC price from DexScreener:", error);
        toast.error("Failed to fetch BTC price.");
      }
    };
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setTransactions(data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        toast.error("Failed to load transaction history.");
      }
    };
    fetchTransactions();
  }, [user]);

useEffect(() => {
  const fetchBeneficiaries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, phone, state, city, zipcode, payment_verified')
        .eq('user_id', user.id)
        .order('id', { ascending: false });
      if (error) throw error;
      setBeneficiaries(data || []);
      setBeneficiaryCount(data?.length || 0);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
      toast.error('Failed to load beneficiaries.');
    } finally {
      setLoading(false);
    }
  };

  fetchBeneficiaries();
}, [user, location.search]); // Add location.search to trigger on redirect

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

useEffect(() => {
  const fetchData = async () => {
    if (!user) {
      console.log("No user, skipping fetchData");
      return;
    }
    setLoading(true);
    try {
      console.log("Starting fetchData for user:", user.id);
      console.log("User ID from auth:", user.id); // Verify user ID

      // Test notifications query first to isolate the issue
      console.log("Fetching notifications...");
      const { data: notificationsData, error: notifError } = await supabase
        .from("notifications")
        .select("id, message, created_at")
        .order("created_at", { ascending: false });

      if (notifError) {
        console.error("Notifications fetch error details:", {
          code: notifError.code,
          message: notifError.message,
          hint: notifError.hint,
          details: notifError.details,
          status: notifError.status,
        });
        if (notifError.code === "42501") {
          console.error("RLS policy violation - check notifications table policies");
        } else if (notifError.code === "404") {
          console.error("Table 'notifications' not found - verify table name and schema");
        } else if (notifError.code === "406") {
          console.error("Not Acceptable - check column names in select: id, message, created_at");
        }
        throw notifError;
      }

      // Log notifications
      console.log("Fetched notifications successfully:");
      if (notificationsData && notificationsData.length > 0) {
        notificationsData.forEach((notification, index) => {
          const watDate = notification.created_at
            ? new Date(notification.created_at).toLocaleString("en-US", {
                timeZone: "Africa/Lagos",
                dateStyle: "short",
                timeStyle: "medium",
              })
            : "Invalid timestamp";
          console.log(`Notification ${index + 1}:`, {
            id: notification.id,
            message: notification.message,
            created_at: watDate,
            raw_created_at: notification.created_at,
          });
        });
      } else {
        console.log("No notifications found in table");
      }
      setNotifications(notificationsData || []);

      // Fetch other data (beneficiaries, settings) - skip ceo_profiles for now to avoid failure
      const [
        { count: benTotal, data: analyticsData, error: benError },
        { data: settingsData, error: settingsError },
      ] = await Promise.all([
        supabase
          .from("beneficiaries")
          .select("state, id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("settings")
          .select("disbursement_date")
          .eq("id", 1)
          .single(),
      ]);

      if (benError) {
        console.error("Beneficiaries error:", benError);
        throw benError;
      }

      // Handle settings as before
      if (settingsError) {
        console.error("Settings fetch error:", settingsError);
        if (settingsError.code === "PGRST116") {
          const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          const defaultDateISO = defaultDate.toISOString();
          console.log("No settings row found, inserting default date:", defaultDateISO);
          const { error: insertError } = await supabase
            .from("settings")
            .insert([{ id: 1, disbursement_date: defaultDateISO }]);
          if (insertError) {
            console.error("Failed to insert default settings:", insertError);
            throw insertError;
          }
          const watDate = new Date(defaultDate.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
          setDisbursementDate(watDate.toISOString());
        } else {
          throw settingsError;
        }
      } else if (!settingsData || !settingsData.disbursement_date) {
        console.warn("No disbursement_date in settings:", settingsData);
        const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const defaultDateISO = defaultDate.toISOString();
        const { error: updateError } = await supabase
          .from("settings")
          .update({ disbursement_date: defaultDateISO })
          .eq("id", 1);
        if (updateError) {
          console.error("Failed to update settings with default date:", updateError);
          throw updateError;
        }
        const watDate = new Date(defaultDate.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
        setDisbursementDate(watDate.toISOString());
      } else {
        const dbDate = settingsData.disbursement_date;
        let parsedDate = new Date(dbDate);
        if (isNaN(parsedDate.getTime())) {
          console.warn("Invalid disbursement_date from DB:", dbDate);
          const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          const defaultDateISO = defaultDate.toISOString();
          const { error: updateError } = await supabase
            .from("settings")
            .update({ disbursement_date: defaultDateISO })
            .eq("id", 1);
          if (updateError) {
            console.error("Failed to update invalid date:", updateError);
            throw updateError;
          }
          parsedDate = defaultDate;
        }

        const watDate = new Date(parsedDate.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
        if (watDate <= new Date()) {
          console.warn("Disbursement date in the past:", watDate);
          const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          const defaultDateISO = defaultDate.toISOString();
          const { error: updateError } = await supabase
            .from("settings")
            .update({ disbursement_date: defaultDateISO })
            .eq("id", 1);
          if (updateError) {
            console.error("Failed to update past date:", updateError);
            throw updateError;
          }
          const newWatDate = new Date(defaultDate.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
          setDisbursementDate(newWatDate.toISOString());
        } else {
          setDisbursementDate(watDate.toISOString());
        }
      }

      const stateMap = {};
      analyticsData?.forEach((b) => {
        stateMap[b.state] = (stateMap[b.state] || 0) + 1;
      });
      const chartData = Object.keys(stateMap).map((state) => ({
        state,
        beneficiaries: stateMap[state],
      }));

      setBeneficiaryCount(benTotal || 0);
      setStateAnalytics(chartData || []);
      if (notificationsData?.length > 0) {
        setHasNewNotifications(true);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [user]);

useEffect(() => {
  if (!disbursementDate) {
    console.log("No disbursementDate set, skipping countdown");
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    return;
  }

  const deadline = new Date(disbursementDate);
  if (isNaN(deadline.getTime())) {
    console.error("Invalid disbursementDate:", disbursementDate);
    setDisbursementDate(null); // Reset to trigger "No date set" in UI
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    return;
  }

  // Convert to WAT (Africa/Lagos) for accurate countdown
  const watDeadline = new Date(deadline.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
  console.log("WAT deadline:", watDeadline.toISOString());

  const interval = setInterval(() => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
    const diff = watDeadline - now;

    if (diff <= 0) {
      console.log("Disbursement date has passed:", watDeadline);
      clearInterval(interval);
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setDisbursementDate(null); // Reset to show "No date set" in UI
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

useEffect(() => {
  const hasShownModal = sessionStorage.getItem("hasShownVerificationModal");
  let modalTimer;

  if (gasFeeStatus.ceo.verified && !hasShownModal) {
    setShowAmountModal(true);
    sessionStorage.setItem("hasShownVerificationModal", "true");
    modalTimer = setTimeout(() => {
      setShowAmountModal(false);
    }, 5000);
  }

  return () => clearTimeout(modalTimer);
}, [gasFeeStatus.ceo.verified]);

useEffect(() => {
  const fee = gasFeeStatus.ceo.verified ? 0.4 : 0;
  setTotalGrant(fee + beneficiaryCount * 0.14);
}, [gasFeeStatus.ceo.verified, beneficiaryCount]);
  const validateBeneficiary = (beneficiary) => {
    if (!beneficiary.full_name || beneficiary.full_name.trim() === "") {
      toast.error("Full name is required for all beneficiaries");
      return false;
    }
    if (!beneficiary.phone || !/^\+?\d{10,14}$/.test(beneficiary.phone)) {
      toast.error("Valid phone number is required for all beneficiaries");
      return false;
    }
    if (!beneficiary.state || beneficiary.state.trim() === "") {
      toast.error("State is required for all beneficiaries");
      return false;
    }
    if (!beneficiary.city || beneficiary.city.trim() === "") {
      toast.error("City is required for all beneficiaries");
      return false;
    }
    if (!beneficiary.zipcode || !/^\d{5,6}$/.test(beneficiary.zipcode)) {
      toast.error("Valid zip code is required for all beneficiaries");
      return false;
    }
    return true;
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
    setBeneficiariesList((prev) => {
      if (prev.length >= 5) {
        toast.error("You can only add up to 5 beneficiaries at a time.");
        return prev;
      }
      return [
        ...prev,
        { full_name: "", phone: "", state: "", city: "", zipcode: "" },
      ];
    });
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) setHasNewNotifications(false);
  };

  const toggleTransactions = () => {
    setShowTransactions(!showTransactions);
  };

  const totalPages = Math.ceil(beneficiaries.length / ITEMS_PER_PAGE);
  const currentItems = beneficiaries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
              <button
                className="lg:hidden mt-2 cursor-pointer"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 flex-col justify-center">
                <div
                  className="relative w-23 h-23 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-pointer overflow-hidden shadow-lg"
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
              </div>
              <nav className="space-y-3 mt-6">
                <a
                  href="#dashboard"
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/10 transition"
                >
                  <Home size={20} /> Home
                </a>
                <a
                  href="#beneficiaries"
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/10 transition"
                >
                  <Users size={20} /> Beneficiaries
                </a>
                <a
                  href="#analytics"
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/10 transition"
                >
                  <BarChart2 size={20} /> Analytics
                </a>
                <button
                  onClick={() => {
                    setAddBeneficiaryOpen(true);
                    if (beneficiariesList.length < 5) {
                      addBeneficiaryRow();
                    }
                  }}
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/10 transition w-full"
                >
                  <PlusSquare size={20} /> Add Beneficiary
                </button>
                <button
                  onClick={() => setOpenCredentialsModal(true)}
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/10 transition w-full"
                >
                  <BarChart2 size={20} /> Credentials/KYC
                </button>
                <button
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/10 transition w-full"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  <DollarSign /> Withdraw
                </button>
                <Link
                  to="/about"
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/10 transition"
                >
                  <Info size={20} /> About Grant
                </Link>
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
              className="relative bg-gray-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl xs:w-[90%] text-white"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowWithdrawModal(false);
                  setIsSubmitted(false);
                  setShowConfirmModal(false);
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
                      setShowConfirmModal(false);
                    }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white p-3 rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    Close
                  </motion.button>
                </motion.div>
              ) : showConfirmModal ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center space-y-6"
                >
                  <AlertCircle size={48} className="mx-auto text-yellow-400" />
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    Confirm Withdrawal
                  </h2>
                  <p className="text-gray-200">
                    Are you sure you want to withdraw {withdrawAmount} {currency} to{" "}
                    {destinationType === "Exchange" && selectedExchange
                      ? `${selectedExchange} (${destinationType})`
                      : destinationType}?
                  </p>
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowConfirmModal(false)}
                      className="w-1/2 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg font-semibold shadow-lg transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsSubmitted(true);
                        setShowConfirmModal(false);
                      }}
                      className="w-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white p-3 rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      Confirm
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <div>
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
                    Withdraw Funds
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Currency */}
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

                    {/* Amount */}
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

                    {/* Exchange or Network (conditionally) */}
                    {destinationType === "Exchange" && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-200 flex items-center gap-2">
                          <Building2 size={16} className="text-cyan-400" />
                          Exchange
                        </label>
                        <div className="flex items-center gap-3">
                          <motion.select
                            value={selectedExchange}
                            onChange={(e) => setSelectedExchange(e.target.value)}
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

                    {/* Wallet / Exchange Address */}
                    <div className="md:col-span-2">
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

                    {/* Withdraw Button */}
                    <motion.button
                      onClick={onSubmit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={
                        !withdrawAmount ||
                        !walletAddress ||
                        (destinationType === "On-Chain" && !network) ||
                        (destinationType === "Exchange" && !selectedExchange)
                      }
                      className="md:col-span-2 w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white p-3 rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      <Send size={16} />
                      Withdraw
                    </motion.button>
                  </div>

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
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gas Fee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl w-[90%] max-w-lg text-center text-white border border-cyan-500/30">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold uppercase mb-4 text-cyan-400">
              ⚠️ Important Notice
            </h2>
            <p className="text-red-400 font-medium mb-4 text-center">
              Payment of 6.70 USDT (CEO) as gas fee is mandatory to complete
              registration and enable disbursement into wallet.
            </p>
            <p className="text-lg uppercase text-gray-200 leading-relaxed">
              Make sure that the <span className="text-cyan-400">network</span>{" "}
              or <span className="text-cyan-400">chain type</span> you&apos;re
              depositing to is <span className="font-semibold">Aptos</span>.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium shadow-md transition"
            >
              Got it ✅
            </button>
          </div>
        </div>
      )}

      {/* Disbursement Modal */}
      {showAmountModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center animate-fadeIn border border-gray-700/50">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              onClick={() => setShowAmountModal(false)}
            >
              <X size={22} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-white shadow-lg animate-pulse">
                $
              </div>
            </div>

            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
              Gas Fee Payment Verified
            </h3>

            <p className="text-gray-300 text-sm mb-3">
              Your CEO gas fee payment has been successfully{" "}
              <span className="text-green-400 font-medium">verified</span>.
            </p>
            <p className="text-gray-200 text-base font-medium mb-2">
              Disbursement will be available within{" "}
              <span className="text-cyan-400 font-semibold">24 hours</span>.
            </p>
            <p className="text-gray-400 text-xs">
              Please ensure your wallet is ready to receive the transaction.
            </p>

            <div className="mt-6">
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-progress rounded-full"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Awaiting disbursement...</p>
            </div>

            <p className="text-sm text-gray-300 mt-6">Thank you for your patience 🙏</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col ml-0 lg:ml-64 z-10 overflow-hidden relative">
        <header
          className="bg-gray-800/30 backdrop-blur-md p-4 flex items-center justify-between lg:sticky lg:top-0 lg:z-10 lg:rounded-b-3xl fixed top-0 left-0 w-full z-20"
        >
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 id="dashboard" className="text-2xl font-bold text-white">
            CEO Dashboard
          </h1>

          <div className="flex gap-4">
            <div className="relative">
              <button onClick={toggleTransactions}>
                <History size={24} />
              </button>
            </div>
            <div className="relative">
              <button onClick={toggleNotifications}>
                <Bell size={24} />
              </button>
              {hasNewNotifications && !notificationsOpen && (
                <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-ping"></span>
              )}
            </div>
          </div>
        </header>

        <main className="p-6 space-y-8 mt-16 bg-gray-900 min-h-screen">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 15px rgba(34, 211, 238, 0.5)",
              }}
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-br from-blue-950 to-indigo-950 p-4 rounded-2xl shadow-lg backdrop-blur-lg hover:shadow-cyan-500/50 transition-all relative cursor-pointer"
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
            </motion.div>

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
                onClick={handleCeoGasFeeDeposit}
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
                <CheckCircle
                  size={16}
                  className={
                    gasFeeStatus.ceo.verified ? "text-green-400" : "text-gray-400"
                  }
                />
                <p className="text-gray-300 text-xs font-medium uppercase tracking-widest">
                  CEO Gas Fee Status
                </p>
              </div>
              <h2 className="text-lg font-semibold text-white mt-2 flex items-center gap-2">
                {gasFeeStatus.ceo.verified ? (
                  <>
                    Deposited & Verified
                    <CheckCircle size={16} className="text-green-400" />
                  </>
                ) : gasFeeStatus.ceo.deposited ? (
                  "Pending Verification"
                ) : (
                  "Not Deposited"
                )}
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
              <div className="flex items-center justify-between">
                <p className="text-gray-300 text-xs font-medium uppercase tracking-widest">
                  Total Grant Disbursed
                </p>
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => setShowGrantInUSDT(!showGrantInUSDT)}
                    className="p-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    <RefreshCcw size={16} className="text-white" />
                  </button>
                </motion.div>
              </div>
              <div className="mt-1 space-y-1">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  {showGrantInUSDT ? (
                    <>
                      <DollarSign size={14} className="text-cyan-400 mr-1" />
                      {btcPrice ? (
                        (totalGrant * btcPrice).toLocaleString()
                      ) : (
                        "Loading..."
                      )}{" "}
                      USDT
                    </>
                  ) : (
                    <>
                      <Bitcoin size={14} className="text-cyan-400 mr-1" />
                      {totalGrant.toFixed(4)} BTC
                    </>
                  )}
                </h2>
              </div>
              <p className="text-gray-300 text-xs font-medium mt-2 uppercase tracking-widest">
                CEO Commission
              </p>
              <h3 className="text-base font-semibold text-white flex items-center">
                {showGrantInUSDT ? (
                  <>
                    <DollarSign size={12} className="text-cyan-400 mr-1" />
                    {btcPrice
                      ? (beneficiaryCount * 0.00058 * btcPrice).toLocaleString()
                      : "Loading..."}{" "}
                    USDT
                  </>
                ) : (
                  <>
                    <Bitcoin size={12} className="text-cyan-400 mr-1" />
                    {(beneficiaryCount * 0.00058).toFixed(6)} BTC
                  </>
                )}
              </h3>
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
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-700/50 relative overflow-hidden backdrop-blur-xl hover:shadow-cyan-400/20 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-50 animate-gradient-x"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock size={18} className="text-cyan-300" />
                  <p className="text-gray-200 text-sm font-semibold uppercase tracking-wide">
                    Disbursement Date
                  </p>
                </div>
              {disbursementDate ? (
  <div className="space-y-2">
    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
      <motion.span
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </motion.span>
    </h2>
    <p className="text-gray-300 text-sm font-medium">
      Scheduled for:{" "}
      {new Date(disbursementDate).toLocaleString("en-US", {
        timeZone: "Africa/Lagos",
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
    </p>
  </div>
) : (
  <p className="text-gray-400 text-base font-medium">
    No disbursement date set. Please check back later.
  </p>
)}
              </div>
              <div className="absolute bottom-2 right-2 text-gray-500 text-xs opacity-50">
                Premium Schedule
              </div>
            </motion.div>
          </div>

          {/* Analytics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/40 backdrop-blur-lg !mt-6 p-6 rounded-3xl shadow-2xl space-y-8"
          >
            <h2 id="analytics" className="text-2xl font-bold text-white mb-4">
              Analytics Dashboard
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900/40 p-4 rounded-3xl shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-3">
                  State-wise Beneficiaries
                </h3>
                {stateAnalytics.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={stateAnalytics}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <XAxis dataKey="state" stroke="#A1A1AA" />
                      <YAxis stroke="#A1A1AA" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #4B5563",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                      />
                      <Bar
                        dataKey="beneficiaries"
                        fill="#22D3EE"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-center">No data available</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Beneficiaries Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-3xl shadow-2xl space-y-6"
          >
            <h2 id="beneficiaries" className="text-2xl font-bold text-white mb-4">
              Beneficiaries
            </h2>
            {loading ? (
              <p className="text-gray-400 text-center">Loading beneficiaries...</p>
            ) : beneficiaries.length ? (
              <>
                <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-200">
  <thead>
    <tr className="border-b border-gray-700">
      <th className="py-2 px-4">Name</th>
      <th className="py-2 px-4">Phone</th>
      <th className="py-2 px-4">State</th>
      <th className="py-2 px-4">City</th>
      <th className="py-2 px-4">Zip Code</th>
      <th className="py-2 px-4">Payment Status</th>
    </tr>
  </thead>
  <tbody>
    {currentItems.map((beneficiary) => (
      <tr key={beneficiary.id} className="border-b border-gray-800">
        <td className="py-2 px-4">{beneficiary.full_name}</td>
        <td className="py-2 px-4">{beneficiary.phone}</td>
        <td className="py-2 px-4">{beneficiary.state}</td>
        <td className="py-2 px-4">{beneficiary.city}</td>
        <td className="py-2 px-4">{beneficiary.zipcode}</td>
        <td className="py-2 px-4">
          {beneficiary.payment_verified ? (
            <span className="text-green-400">Verified</span>
          ) : (
            <span className="text-yellow-400">Pending</span>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
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
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center">
                No beneficiaries added yet.
              </p>
            )}
          </motion.div>

   
<AnimatePresence>
  {addBeneficiaryOpen && (
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
        className="bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <button
          onClick={() => {
            setAddBeneficiaryOpen(false);
            setBeneficiariesList([]);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-6">
          Add Beneficiaries (Up to 5)
        </h3>
    <form
  onSubmit={async (e) => {
    e.preventDefault();
    // Validate all beneficiaries
    const isValid = beneficiariesList.every(validateBeneficiary);
    if (!isValid) return;

    try {
      // Store beneficiaries temporarily in sessionStorage
      sessionStorage.setItem(
        'pendingBeneficiaries',
        JSON.stringify(beneficiariesList)
      );

      // Redirect to PaymentPage for beneficiary gas fee
      navigate('/payment', {
        state: {
          userId: user.id,
          totalAmount: beneficiariesList.length * 1.35, // $0.14 per beneficiary
          type: 'beneficiary_gas_fee',
          beneficiaries: beneficiariesList,
        },
      });

      toast.success('Redirecting to payment page...');
      setAddBeneficiaryOpen(false);
      setBeneficiariesList([]);
    } catch (err) {
      console.error('Error initiating payment:', err);
      toast.error('Failed to initiate payment: ' + err.message);
    }
  }}
>
  {beneficiariesList.map((beneficiary, index) => (
    <div key={index} className="space-y-4 mb-6 p-4 bg-gray-800/50 rounded-lg">
      <h4 className="text-lg font-semibold text-gray-200">
        Beneficiary {index + 1}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={beneficiary.full_name}
            onChange={(e) => handleBeneficiaryChange(index, e)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={beneficiary.phone}
            onChange={(e) => handleBeneficiaryChange(index, e)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            State
          </label>
          <input
            type="text"
            name="state"
            placeholder="State"
            value={beneficiary.state}
            onChange={(e) => handleBeneficiaryChange(index, e)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            City
          </label>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={beneficiary.city}
            onChange={(e) => handleBeneficiaryChange(index, e)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Zip Code
          </label>
          <input
            type="text"
            name="zipcode"
            placeholder="Zip Code"
            value={beneficiary.zipcode}
            onChange={(e) => handleBeneficiaryChange(index, e)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            required
          />
        </div>
      </div>
      {beneficiariesList.length > 1 && (
        <button
          type="button"
          onClick={() =>
            setBeneficiariesList((prev) => prev.filter((_, i) => i !== index))
          }
          className="text-red-400 hover:text-red-300 text-sm mt-2"
        >
          Remove Beneficiary
        </button>
      )}
    </div>
  ))}
  <div className="flex justify-between items-center mb-6">
    <button
      type="button"
      onClick={addBeneficiaryRow}
      disabled={beneficiariesList.length >= 5}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition"
    >
      Add Another Beneficiary
    </button>
    <div className="text-gray-400 text-sm">
      {beneficiariesList.length}/5 Beneficiaries
    </div>
  </div>
  <div className="flex justify-end gap-4">
    <button
      type="button"
      onClick={() => {
        setAddBeneficiaryOpen(false);
        setBeneficiariesList([]);
      }}
      className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={beneficiariesList.length === 0}
      className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition disabled:opacity-50"
    >
      Proceed to Payment
    </button>
  </div>
</form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* Notifications Sidebar */}
<AnimatePresence>
  {notificationsOpen && (
    <motion.aside
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      exit={{ x: 300 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 w-80 bg-gray-800/90 backdrop-blur-lg p-6 h-full shadow-2xl z-30 rounded-l-3xl overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Notifications</h2>
        <button
          onClick={() => setNotificationsOpen(false)}
          className="text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">
        {notifications.length ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
            >
              <p className="text-gray-200">{notification.message}</p>
              <p className="text-gray-400 text-xs mt-2">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No notifications</p>
        )}
      </div>
    </motion.aside>
  )}
</AnimatePresence>

{/* Transaction History Sidebar */}
<AnimatePresence>
  {showTransactions && (
    <motion.aside
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      exit={{ x: 300 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 w-80 bg-gray-800/90 backdrop-blur-lg p-6 h-full shadow-2xl z-30 rounded-l-3xl overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
        <button
          onClick={() => setShowTransactions(false)}
          className="text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">
        {paginatedTransactions.length ? (
          <>
            {paginatedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
              >
                <p className="text-gray-200">
                  {transaction.type === "ceo_gas_fee"
                    ? "CEO Gas Fee Deposit"
                    : `Withdrawal to ${transaction.destination}`}
                </p>
                <p className="text-gray-200">
                  Amount: {transaction.amount} {transaction.currency}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() =>
                  setNewCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={NewCurrentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-200">
                Page {NewCurrentPage} of {NewTotalPages}
              </span>
              <button
                onClick={() =>
                  setNewCurrentPage((prev) =>
                    Math.min(prev + 1, NewTotalPages)
                  )
                }
                disabled={NewCurrentPage === NewTotalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center">No transactions yet</p>
        )}
      </div>
    </motion.aside>
  )}
</AnimatePresence>

{/* Credentials Modal */}
<CredentialsModal
  open={openCredentialsModal}
  onClose={() => setOpenCredentialsModal(false)}
  user={user}
/>
</main>
</div>
</div>
  )
}
