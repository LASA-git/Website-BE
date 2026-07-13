const express = require("express");

const {
  getActivityGalleries,
  updateActivityGallery
} = require("../controllers/activityGalleriesController");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { updateActivityGallerySchema } = require("../validators/activityGalleriesSchemas");

const router = express.Router();

router.get("/", getActivityGalleries);
router.put(
  "/:section",
  requireAuth,
  validate(updateActivityGallerySchema),
  updateActivityGallery
);

module.exports = router;
