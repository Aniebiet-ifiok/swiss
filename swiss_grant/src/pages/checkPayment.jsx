import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { supabase } from "../supabase";

export default function useCheckPayment(userWalletAddress) {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userWalletAddress) return;

    const checkPayment = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/"); // or Ethereum RPC
        const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT contract (Ethereum)
        const abi = [
          "function balanceOf(address) view returns (uint256)"
        ];
        const contract = new ethers.Contract(usdtAddress, abi, provider);

        const balance = await contract.balanceOf(userWalletAddress);
        const balanceInUSDT = ethers.utils.formatUnits(balance, 6); // USDT has 6 decimals

        if (Number(balanceInUSDT) >= 6.2) {
          setPaid(true);

          // Update Supabase automatically
          const { data, error } = await supabase
            .from("users")
            .update({ has_paid_gas: true })
            .eq("wallet_address", userWalletAddress);

          if (error) console.error("Supabase update error:", error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(checkPayment, 15000); // check every 15 seconds
    checkPayment(); // initial check

    return () => clearInterval(interval);
  }, [userWalletAddress]);

  return { paid, loading };
}
