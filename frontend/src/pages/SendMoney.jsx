import React, { useState } from "react";
import Heading from "../components/Heading";
import { useSearchParams } from "react-router-dom";
import { sendMoney } from "../services/operations/transactionApi";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { tokenAtom, userAtom } from "../store/atoms";
import Appbar from "../components/Appbar";

const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name")?.split("_").join(" ") || "Unknown User";
  const id = searchParams.get("id");
  const token = useRecoilValue(tokenAtom);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const user = useRecoilValue(userAtom);

  // Validate amount input
  const isValidAmount = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  };

  function handleChange(event) {
    const value = event.target.value;
    setAmount(value);
    // Clear message when user starts typing
    if (message.text) setMessage({ text: "", type: "" });
  }

  async function handleClick() {
    if (!amount.trim()) {
      setMessage({ text: "Please enter an amount", type: "error" });
      return;
    }

    if (!isValidAmount(amount)) {
      setMessage({ text: "Please enter a valid positive amount", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await sendMoney(amount, id, token);
      
      if (response === "Transfer successful") {
        setAmount("");
        setMessage({ text: "Payment successful!", type: "success" });
        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: response || "Transfer failed", type: "error" });
      }
    } catch (error) {
      setMessage({ 
        text: error.message || "Something went wrong. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !loading) {
      handleClick();
    }
  };

  return (
    <div>
      <Appbar user={user.firstname} />
      <div className="h-screen bg-slate-300 flex justify-center items-center">
        <div className="bg-white rounded-lg w-[80%] sm:w-[50%] lg:w-[23%] text-center p-6">
          <div className="flex flex-col">
            <Heading label={"Send Money"} />
            <div className="flex items-center mt-10">
              <div className="flex justify-center items-center w-12 h-12 bg-green-400 rounded-full">
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${name}`}
                  className="h-[90%] w-[90%] rounded-full"
                  alt={`${name} avatar`}
                />
              </div>
              <div className="font-bold text-xl ml-3">{name}</div>
            </div>
            <div className="mt-1">
              <label className="flex flex-col">
                <span className="block font-semibold text-sm self-start">
                  Amount (in RS)
                </span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  name="amount"
                  value={amount}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-2 mt-2 py-1 border rounded border-slate-200 focus:outline-none focus:border-green-500 transition-colors"
                  disabled={loading}
                />
              </label>
            </div>
            
            {/* Message Display */}
            {message.text && (
              <div className={`mt-2 text-sm font-medium ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}>
                {message.text}
              </div>
            )}
            
            <button
              onClick={handleClick}
              disabled={loading || !amount.trim()}
              className={`my-3 w-full px-5 py-2 rounded text-white font-semibold transition-all duration-200 ${
                loading || !amount.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 focus:scale-[1.01] cursor-pointer"
              }`}
            >
              {loading ? "Processing..." : "Initiate Transfer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;
