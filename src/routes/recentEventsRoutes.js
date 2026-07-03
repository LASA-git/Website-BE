const express = require("express");

const {
  getRecentEventsSection,
  updateRecentEventsSection
} = require("../controllers/recentEventsController");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { updateRecentEventsSectionSchema } = require("../validators/recentEventsSchemas");

const router = express.Router();

router.get("/", getRecentEventsSection);
router.put("/", requireAuth, validate(updateRecentEventsSectionSchema), updateRecentEventsSection);

module.exports = router;
