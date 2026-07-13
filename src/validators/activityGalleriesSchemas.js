const { z } = require("zod");

const optionalText = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string().optional()
);

const activityGalleryItemSchema = z.object({
  imageUrl: z.string().url(),
  caption: optionalText,
  altText: optionalText,
  order: z.number().int().nonnegative().optional()
});

const sectionSchema = z.enum(["healthcare", "sociocare", "educare"]);

const updateActivityGallerySchema = z.object({
  params: z.object({
    section: sectionSchema
  }),
  body: z.object({
    items: z.array(activityGalleryItemSchema)
  })
});

module.exports = {
  sectionSchema,
  updateActivityGallerySchema
};
