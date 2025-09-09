import React, { useEffect, useState } from "react";
import Appbar from "../components/Appbar";
import Balance from "../components/Balance";
import { useRecoilValue } from "recoil";
import { tokenAtom, userAtom } from "../store/atoms";
import { getBalance } from "../services/operations/transactionApi";
import { Users } from "../components/Users";

const Dashboard = () => {
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = useRecoilValue(tokenAtom);
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError("");
        const userBalance = await getBalance(token);
        setBalance(userBalance);
      } catch (err) {
        setError("Failed to fetch balance. Please refresh the page.");
        console.error("Balance fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBalance();
    }
  }, [token]);

  return (
    <div>
      <Appbar user={user.firstname} />
      <Balance balance={balance} loading={loading} error={error} />
      <Users />
    </div>
  );
};

export default Dashboard;
