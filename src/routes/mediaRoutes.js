const express = require("express");

const { createUploadUrl } = require("../controllers/mediaController");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { presignSchema } = require("../validators/mediaSchemas");

const router = express.Router();

router.post("/presign", requireAuth, validate(presignSchema), createUploadUrl);

module.exports = router;
