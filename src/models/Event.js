const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    eventYear: { type: Number, required: true },
    coverImageUrl: { type: String, trim: true },
    gallery: [{ type: String, trim: true }],
    flyerUrl: { type: String, trim: true },
    flyerOptions: [{ type: String, trim: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
  },
  { timestamps: true }
);

eventSchema.pre("validate", function setDerivedDates(next) {
  if (!this.startDate) {
    return next();
  }

  const start = new Date(this.startDate);
  const year = start.getFullYear();
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  this.eventYear = year;
  this.endDate = endDate;

  return next();
});

eventSchema.virtual("isArchived").get(function isArchived() {
  const currentYear = new Date().getFullYear();
  return this.eventYear < currentYear;
});

eventSchema.set("toJSON", { virtuals: true });

eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
