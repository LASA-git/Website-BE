const Volunteer = require("../models/Volunteer");
const { asyncHandler } = require("../utils/asyncHandler");

const createVolunteer = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  const volunteer = await Volunteer.create(payload);
  return res.status(201).json({ volunteer });
});

module.exports = { createVolunteer };
