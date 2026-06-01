const express = require("express");

const { registerAdmin, loginAdmin, getProfile } = require("../controllers/authController");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { registerSchema, loginSchema } = require("../validators/authSchemas");

const router = express.Router();

router.post("/register", validate(registerSchema), registerAdmin);
router.post("/login", validate(loginSchema), loginAdmin);
router.get("/me", requireAuth, getProfile);

module.exports = router;
