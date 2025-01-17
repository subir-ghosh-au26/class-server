const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Assuming you have an Admin model
const { body, validationResult } = require("express-validator");
const logger = require("../config/logger");

router.post(
  "/register",
  [
    body("email", "Email is not valid").isEmail(),
    body("password", "Password must be at least 6 character").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const adminExist = await Admin.findOne({ email });
      if (adminExist) {
        return res.status(400).json({ message: "Admin already exist" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const admin = await Admin.create({ email, password: hashedPassword });

      if (admin) {
        res.status(201).json({
          message: "Admin registered successfully!",
          _id: admin._id,
          email: admin.email,
        });
        logger.info(`Admin ${email} registered successfully`);
      } else {
        res.status(400).json({ message: "Invalid admin data" });
      }
    } catch (e) {
      console.error("Error registering admin: ", e);
      logger.error("Error registering admin", e);
      res.status(500).json({ message: "Failed to register admin" });
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Email is not valid").isEmail(),
    body("password", "Password is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(200).json({
        message: "Logged in successful!",
        token,
        _id: admin._id,
        email: admin.email,
      });
      logger.info(`Admin ${email} logged in successfully`);
    } catch (e) {
      console.error("Error logging in admin: ", e);
      logger.error("Error logging in admin", e);
      res.status(500).json({ message: "Failed to login admin" });
    }
  }
);

module.exports = router;
