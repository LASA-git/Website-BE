const express = require("express");

const {
  listCurrentYearEvents,
  listArchivedEvents,
  listActiveEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  generateFlyerOptions,
  selectFlyer
} = require("../controllers/eventController");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const {
  createEventSchema,
  updateEventSchema,
  eventIdSchema,
  selectFlyerSchema
} = require("../validators/eventSchemas");

const router = express.Router();

router.get("/", listCurrentYearEvents);
router.get("/active", listActiveEvents);
router.get("/archived", listArchivedEvents);
router.get("/:id", validate(eventIdSchema), getEventById);

router.post("/", requireAuth, validate(createEventSchema), createEvent);
router.put("/:id", requireAuth, validate(updateEventSchema), updateEvent);
router.delete("/:id", requireAuth, validate(eventIdSchema), deleteEvent);

router.post(
  "/:id/flyer/generate",
  requireAuth,
  validate(eventIdSchema),
  generateFlyerOptions
);
router.post(
  "/:id/flyer/select",
  requireAuth,
  validate(selectFlyerSchema),
  selectFlyer
);

module.exports = router;
