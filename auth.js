const mongoose = require('mongoose');
const User = require('./models/User.js'); 
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
dotenv.config();
/*  */
// Create Access Token
module.exports.createAccessToken = (user) => {
  const data = {
    id: user._id,
    email: user.email,
    isAdmin: user.isAdmin,
  };
  return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
};

// Verify Token Middleware
module.exports.verify = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ auth: "Failed. No Token Provided" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length); // Remove 'Bearer ' prefix
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ auth: "Failed", message: err.message });
    }

    req.user = decodedToken;
    next();
  });
};

// Verify Admin Middleware
module.exports.verifyAdmin = async (req, res, next) => {
  try {
    // Check if there is already an admin in the database
    const existingAdmin = await User.findOne({ isAdmin: true });

    // Allow the request to proceed if no admin exists (first user can be made admin)
    if (!existingAdmin) {
      return next();
    }

    // If an admin exists, check if the current user is an admin
    if (req.user && req.user.isAdmin) {
      return next();
    }

    // If there is an admin and the requester is not an admin, forbid the action
    return res.status(403).json({
      auth: "Failed",
      message: "Action Forbidden",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Is Logged In Middleware
module.exports.isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Global Error Handler Middleware
module.exports.errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.status || 500;
  const errorMessage = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: {
      message: errorMessage,
      errorCode: err.code || "SERVER_ERROR",
      details: err.details || null,
    },
  });
};

// Authentication Middleware
module.exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: "Token is not valid" });

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};
