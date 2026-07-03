const mongoose = require("mongoose");

const carouselItemSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    altText: { type: String, trim: true },
    order: { type: Number, required: true, default: 0 }
  },
  { _id: true }
);

const youtubeItemSchema = new mongoose.Schema(
  {
    videoId: { type: String, trim: true },
    youtubeUrl: { type: String, trim: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, required: true, default: 0 }
  },
  { _id: true }
);

const recentEventsSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "home-recent-events",
      trim: true
    },
    carouselItems: [carouselItemSchema],
    youtubeItems: [youtubeItemSchema],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecentEventsSection", recentEventsSectionSchema);
