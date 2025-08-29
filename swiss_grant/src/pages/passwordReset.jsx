import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { supabase } from "../supabase";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    console.log("Update User Response:", { data, error }); // Debug line

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-gray-900 text-white">
      <div className="bg-gray-800/60 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md border border-cyan-400/15">
        <h2 className="text-3xl font-bold text-center mb-8 text-cyan-300">
          Set New Password
        </h2>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-200 font-medium mb-2">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 pr-10"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-14 right-3 transform -translate-y-1/2 text-gray-400 hover:text-cyan-300"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}