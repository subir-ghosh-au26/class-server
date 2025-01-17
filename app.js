const express = require("express");
const cors = require("cors");
const feedbackRoutes = require("./routes/feedbackRoutes");
const connectDB = require("./config/database");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const logger = require("./config/logger");

// Connect to Database
connectDB();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Middleware
app.use(helmet()); // Protect app from well known web vulnerabilites by setting HTTP headers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for handling form data

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

//Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});
