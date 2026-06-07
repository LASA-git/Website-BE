const mongoose = require("mongoose");
const {
  formatDateOnlyUTC,
  getCurrentUTCYear,
  getYearEndUTC
} = require("../utils/dateUtils");

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
  const year = start.getUTCFullYear();
  const endDate = getYearEndUTC(year);

  this.eventYear = year;
  this.endDate = endDate;

  return next();
});

eventSchema.virtual("isArchived").get(function isArchived() {
  const currentYear = getCurrentUTCYear();
  return this.eventYear < currentYear;
});

const normalizeDateFields = (_doc, ret) => {
  if (ret.startDate) {
    ret.startDate = formatDateOnlyUTC(ret.startDate);
  }

  if (ret.endDate) {
    ret.endDate = formatDateOnlyUTC(ret.endDate);
  }

  return ret;
};

eventSchema.set("toJSON", {
  virtuals: true,
  transform: normalizeDateFields
});

eventSchema.set("toObject", {
  virtuals: true,
  transform: normalizeDateFields
});

module.exports = mongoose.model("Event", eventSchema);
