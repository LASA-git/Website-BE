const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const { env } = require("../config/env");
const { asyncHandler } = require("../utils/asyncHandler");

const issueToken = (admin) => {
  return jwt.sign({ id: admin._id, email: admin.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

const registerAdmin = asyncHandler(async (req, res) => {
  if (env.ADMIN_REGISTRATION_KEY) {
    const providedKey = req.headers["x-admin-registration-key"];
    if (providedKey !== env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({ message: "Registration key invalid" });
    }
  }

  const { name, email, password } = req.validated.body;

  const existing = await Admin.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Admin already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ name, email, passwordHash });

  const token = issueToken(admin);
  return res.status(201).json({ token, admin: { id: admin._id, name, email } });
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = issueToken(admin);
  return res.json({ token, admin: { id: admin._id, name: admin.name, email } });
});

const getProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select("name email");
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  return res.json({ admin });
});

module.exports = { registerAdmin, loginAdmin, getProfile };
