const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const accountRoutes = require("./routes/accountRoutes");
const { authLimiter, transferLimiter } = require("./middlewares/rateLimit");

// Middleware
app.use(
  cors({
    origin: "https://payments-app-dusky.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
require("dotenv").config();

// Database connection
const dbConnect = require("./config/db");
dbConnect();

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "Payments App API is running...",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/user",
      accounts: "/api/v1/account"
    }
  });
});

// Apply rate limiting to routes
app.use("/api/v1/user", authLimiter);
app.use("/api/v1/account", transferLimiter);

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/account", accountRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Endpoint not found" 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.message
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry found"
    });
  }
  
  res.status(500).json({ 
    success: false,
    message: "Internal server error. Please try again later.",
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
