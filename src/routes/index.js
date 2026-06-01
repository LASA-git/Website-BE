const express = require("express");

const authRoutes = require("./authRoutes");
const eventRoutes = require("./eventRoutes");
const mediaRoutes = require("./mediaRoutes");
const healthRoutes = require("./healthRoutes");
const volunteerRoutes = require("./volunteerRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/media", mediaRoutes);
router.use("/health", healthRoutes);
router.use("/volunteers", volunteerRoutes);

module.exports = router;
