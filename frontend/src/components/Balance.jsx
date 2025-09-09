import React from "react";
import SubHeading from "./SubHeading";

const Balance = ({ balance, loading, error }) => {
  const formatBalance = (amount) => {
    if (typeof amount === 'number') {
      return `₹${amount.toFixed(2)}`;
    }
    return amount;
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-14 py-4">
        <SubHeading label={"Your Balance"} />
        <div className="text-2xl font-bold text-slate-600 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-14 py-4">
        <SubHeading label={"Your Balance"} />
        <div className="text-red-500 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-14 py-4">
      <SubHeading label={"Your Balance"} />
      <div className="text-2xl font-bold text-slate-600">
        {formatBalance(balance)}
      </div>
    </div>
  );
};

export default Balance;
