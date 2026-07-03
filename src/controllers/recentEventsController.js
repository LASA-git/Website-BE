const RecentEventsSection = require("../models/RecentEventsSection");
const { asyncHandler } = require("../utils/asyncHandler");

const SECTION_KEY = "home-recent-events";
const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

function extractYouTubeVideoId(input) {
  if (!input || typeof input !== "string") {
    return null;
  }

  const value = input.trim();
  if (!value) {
    return null;
  }

  if (YOUTUBE_ID_REGEX.test(value)) {
    return value;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(value);
  } catch {
    return null;
  }

  const host = parsedUrl.hostname.toLowerCase();

  if (host === "youtu.be") {
    const pathId = parsedUrl.pathname.replace(/^\//, "").split("/")[0];
    return YOUTUBE_ID_REGEX.test(pathId) ? pathId : null;
  }

  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const fromQuery = parsedUrl.searchParams.get("v");
    if (fromQuery && YOUTUBE_ID_REGEX.test(fromQuery)) {
      return fromQuery;
    }

    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    if (!segments.length) {
      return null;
    }

    const marker = segments[0];
    const fromPath = segments[1];
    if (["embed", "shorts", "live"].includes(marker) && YOUTUBE_ID_REGEX.test(fromPath || "")) {
      return fromPath;
    }
  }

  return null;
}

function normalizeCarouselItems(items) {
  return (items || []).map((item, index) => ({
    imageUrl: item.imageUrl,
    altText: item.altText || "",
    order: Number.isInteger(item.order) ? item.order : index
  }));
}

function normalizeYouTubeItems(items) {
  return (items || []).map((item, index) => {
    const hasTitle = Boolean(item.title && item.title.trim());
    const hasDescription = Boolean(item.description && item.description.trim());
    const source = item.videoId || item.youtubeUrl;
    const hasSource = Boolean(source && String(source).trim());

    let videoId = "";
    let youtubeUrl = "";

    if (hasSource) {
      const parsedVideoId = extractYouTubeVideoId(source);
      if (!parsedVideoId) {
        const error = new Error("Invalid YouTube link or video ID");
        error.status = 400;
        throw error;
      }

      videoId = parsedVideoId;
      youtubeUrl = item.youtubeUrl || `https://www.youtube.com/watch?v=${parsedVideoId}`;
    }

    if (!videoId && !hasTitle && !hasDescription) {
      const error = new Error("At least one of video link, title, or description is required");
      error.status = 400;
      throw error;
    }

    return {
      videoId,
      youtubeUrl,
      title: item.title || "",
      description: item.description || "",
      order: Number.isInteger(item.order) ? item.order : index
    };
  });
}

const getRecentEventsSection = asyncHandler(async (_req, res) => {
  let section = await RecentEventsSection.findOne({ key: SECTION_KEY }).lean();

  if (!section) {
    section = {
      key: SECTION_KEY,
      carouselItems: [],
      youtubeItems: []
    };
  }

  const carouselItems = [...(section.carouselItems || [])].sort((a, b) => a.order - b.order);
  const youtubeItems = [...(section.youtubeItems || [])].sort((a, b) => a.order - b.order);

  return res.json({
    recentEvents: {
      carouselItems,
      youtubeItems,
      updatedAt: section.updatedAt || null
    }
  });
});

const updateRecentEventsSection = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  const update = {
    updatedBy: req.admin.id
  };

  if (payload.carouselItems) {
    update.carouselItems = normalizeCarouselItems(payload.carouselItems);
  }

  if (payload.youtubeItems) {
    update.youtubeItems = normalizeYouTubeItems(payload.youtubeItems);
  }

  const section = await RecentEventsSection.findOneAndUpdate(
    { key: SECTION_KEY },
    {
      $set: update,
      $setOnInsert: { key: SECTION_KEY }
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );

  const carouselItems = [...(section.carouselItems || [])].sort((a, b) => a.order - b.order);
  const youtubeItems = [...(section.youtubeItems || [])].sort((a, b) => a.order - b.order);

  return res.json({
    recentEvents: {
      carouselItems,
      youtubeItems,
      updatedAt: section.updatedAt || null
    }
  });
});

module.exports = {
  getRecentEventsSection,
  updateRecentEventsSection
};
