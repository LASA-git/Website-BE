const { z } = require("zod");

const optionalText = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string().optional()
);

const carouselItemSchema = z.object({
  imageUrl: z.string().url(),
  altText: optionalText,
  order: z.number().int().nonnegative().optional()
});

const youtubeItemSchema = z.object({
  videoId: optionalText,
  youtubeUrl: optionalText,
  title: optionalText,
  description: optionalText,
  order: z.number().int().nonnegative().optional()
}).superRefine((value, ctx) => {
  const hasVideoId = Boolean(value.videoId && value.videoId.trim());
  const hasYoutubeUrl = Boolean(value.youtubeUrl && value.youtubeUrl.trim());
  const hasTitle = Boolean(value.title && value.title.trim());
  const hasDescription = Boolean(value.description && value.description.trim());

  if (!hasVideoId && !hasYoutubeUrl && !hasTitle && !hasDescription) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one of videoId, youtubeUrl, title, or description is required"
    });
  }
});

const updateRecentEventsSectionSchema = z.object({
  body: z.object({
    carouselItems: z.array(carouselItemSchema).optional(),
    youtubeItems: z.array(youtubeItemSchema).optional()
  })
});

module.exports = {
  updateRecentEventsSectionSchema
};
