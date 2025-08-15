import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";
import useCheckPayment from "../pages/checkPayment";

export default function ProtectRoute({ children }) {
  const [userWallet, setUserWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      const { data } = await supabase.from("users").select("wallet_address, has_paid_gas").eq("id", user.id).single();
      if (data) setUserWallet(data.wallet_address);

      if (data?.has_paid_gas) setAllowed(true);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const { paid, loading: checking } = useCheckPayment(userWallet);

  useEffect(() => {
    if (paid) setAllowed(true);
  }, [paid]);

  if (loading || checking) return <div className="text-white text-center mt-10">Checking payment...</div>;
  if (!allowed) return <Navigate to="/payment" />;

  return children;
}
