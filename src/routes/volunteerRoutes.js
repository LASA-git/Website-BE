const express = require("express");

const { createVolunteer } = require("../controllers/volunteerController");
const { validate } = require("../middleware/validate");
const { createVolunteerSchema } = require("../validators/volunteerSchemas");

const router = express.Router();

router.post("/", validate(createVolunteerSchema), createVolunteer);

module.exports = router;
