const ActivityGalleries = require("../models/ActivityGalleries");
const { asyncHandler } = require("../utils/asyncHandler");

const SECTION_KEY = "home-activity-galleries";
const ALLOWED_SECTIONS = ["healthcare", "sociocare", "educare"];

function normalizeItems(items) {
  return (items || []).map((item, index) => ({
    imageUrl: item.imageUrl,
    caption: item.caption || "",
    altText: item.altText || "",
    order: Number.isInteger(item.order) ? item.order : index
  }));
}

function sortItems(items) {
  return [...(items || [])].sort((a, b) => a.order - b.order);
}

async function getSectionDocument() {
  let document = await ActivityGalleries.findOne({ key: SECTION_KEY }).lean();

  if (!document) {
    document = {
      key: SECTION_KEY,
      healthcare: [],
      sociocare: [],
      educare: []
    };
  }

  return document;
}

const getActivityGalleries = asyncHandler(async (_req, res) => {
  const galleries = await getSectionDocument();

  return res.json({
    galleries: {
      healthcare: sortItems(galleries.healthcare),
      sociocare: sortItems(galleries.sociocare),
      educare: sortItems(galleries.educare),
      updatedAt: galleries.updatedAt || null
    }
  });
});

const updateActivityGallery = asyncHandler(async (req, res) => {
  const { section } = req.validated.params;
  const { items } = req.validated.body;

  if (!ALLOWED_SECTIONS.includes(section)) {
    const error = new Error("Invalid gallery section");
    error.status = 400;
    throw error;
  }

  const update = {
    updatedBy: req.admin.id,
    [section]: normalizeItems(items)
  };

  const document = await ActivityGalleries.findOneAndUpdate(
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

  return res.json({
    galleries: {
      healthcare: sortItems(document.healthcare),
      sociocare: sortItems(document.sociocare),
      educare: sortItems(document.educare),
      updatedAt: document.updatedAt || null
    }
  });
});

module.exports = {
  getActivityGalleries,
  updateActivityGallery
};
