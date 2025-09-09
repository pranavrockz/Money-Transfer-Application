const { default: mongoose } = require("mongoose");
const Account = require("../models/account");
const User = require("../models/user");

exports.getBalance = async (req, res) => {
  try {
    // get the userId from auth middleware
    const userId = req.userId;

    // Check the balance
    const account = await Account.findOne({ userId: userId });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    // return res
    res.status(200).json({
      success: true,
      balance: account.balance,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

exports.transferBalance = async (req, res) => {
  try {
    // Get the userId of the account you wish to transfer the amount and the amount
    const { amount, to } = req.body;

    // Validate input
    if (!amount || !to) {
      return res.status(400).json({ 
        success: false,
        message: "Amount and recipient ID are required" 
      });
    }

    // Check if amount is valid
    if (amount <= 0 || !Number.isFinite(amount)) {
      return res.status(400).json({ 
        success: false,
        message: "Amount must be a positive number" 
      });
    }

    // Prevent self-transfer
    if (req.userId === to) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot transfer money to yourself" 
      });
    }

    // Create a session and start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if the user sending has sufficient balance
      const account = await Account.findOne({ userId: req.userId }).session(session);
      if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false,
          message: "Insufficient balance" 
        });
      }

      // Check if user to which you're sending is valid or not
      const toAccount = await Account.findOne({ userId: to }).session(session);
      if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false,
          message: "Recipient account not found" 
        });
      }

      // Perform the transfer if everything is okay
      await Account.updateOne(
        { userId: req.userId },
        { $inc: { balance: -amount } }
      ).session(session);
      
      await Account.updateOne(
        { userId: to },
        { $inc: { balance: amount } }
      ).session(session);

      // Commit the transaction
      await session.commitTransaction();

      // return res
      res.status(200).json({
        success: true,
        message: "Transfer successful",
        amount: amount,
        newBalance: account.balance - amount
      });
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
