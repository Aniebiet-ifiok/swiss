export default function WithdrawModal({ show, onClose }) {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");

  if (!show) return null;

  const handleSubmit = () => {
    if (!amount || !wallet) {
      alert("Please fill in all fields!");
      return;
    }
    console.log("Withdraw request:", { amount, wallet });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          ✖
        </button>
        <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Wallet Address
          </label>
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter wallet address"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}
