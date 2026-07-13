const mongoose = require("mongoose");

const activityGalleryItemSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    caption: { type: String, trim: true },
    altText: { type: String, trim: true },
    order: { type: Number, required: true, default: 0 }
  },
  { _id: true }
);

const activityGalleriesSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "home-activity-galleries",
      trim: true
    },
    healthcare: [activityGalleryItemSchema],
    sociocare: [activityGalleryItemSchema],
    educare: [activityGalleryItemSchema],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityGalleries", activityGalleriesSchema);
