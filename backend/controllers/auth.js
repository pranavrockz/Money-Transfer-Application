const jwt = require("jsonwebtoken");
const Zod = require("zod");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Account = require("../models/account");
require("dotenv").config();

// Using Zod to validate signup data
const signupData = Zod.object({
  username: Zod.string().email(),
  password: Zod.string().min(6, "Password must be at least 6 characters long"),
  firstname: Zod.string(),
  lastname: Zod.string(),
});

exports.signup = async (req, res) => {
  try {
    // Get the data from req body
    const { username, password, firstname, lastname } = req.body;

    // Validate data using Zod
    const validatedInputs = signupData.safeParse({
      username,
      password,
      firstname,
      lastname,
    });

    if (!validatedInputs.success) {
      const errors = validatedInputs.error.errors.map(err => err.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors 
      });
    }

    // If user already exists
    if (await User.findOne({ username: username })) {
      return res.status(409).json({ message: "Email already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save the user entry in DB
    const user = await User.create({
      username: username,
      firstname: firstname,
      lastname: lastname,
      password: hashedPassword,
    });

    // Give the user some balance beforehand to play with
    const userId = user._id;
    await Account.create({
      userId: userId,
      balance: 1 + Math.random() * 10000,
    });

    // send res
    res.status(201).json({ 
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// Using Zod to validate inputs
const signinData = Zod.object({
  username: Zod.string().email(),
  password: Zod.string(),
});

exports.signin = async (req, res) => {
  try {
    // Get the data from req body
    const { username, password } = req.body;

    // validate using Zod
    const validatedInputs = signinData.safeParse({ username, password });

    if (!validatedInputs.success) {
      return res.status(400).json({ message: "Invalid email or password format" });
    }

    // Check if user exists
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    // Send res
    res.status(200).json({ 
      token: token,
      user: {
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
