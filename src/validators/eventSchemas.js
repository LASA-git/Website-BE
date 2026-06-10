const { z } = require("zod");
const { normalizeDateOnlyString } = require("../utils/dateUtils");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);
const emptyToUndefined = (value) => (value === "" ? undefined : value);
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const dateOnlyString = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return value;
  }

  const normalized = normalizeDateOnlyString(value);
  return normalized || value;
}, z.string().refine((value) => normalizeDateOnlyString(value) !== null, {
  message: "startDate must be a valid date in YYYY-MM-DD format"
}));

const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    location: z.string().optional(),
    startDate: dateOnlyString,
    coverImageUrl: optionalUrl,
    gallery: z.array(z.string().url()).optional(),
    registrationLink: optionalUrl,
    flyerUrl: optionalUrl
  })
});

const updateEventSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    startDate: dateOnlyString.optional(),
    coverImageUrl: optionalUrl,
    gallery: z.array(z.string().url()).optional(),
    registrationLink: optionalUrl,
    flyerUrl: optionalUrl
  })
});

const eventIdSchema = z.object({
  params: z.object({ id: objectId })
});

const selectFlyerSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    selectedUrl: z.string().url()
  })
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  eventIdSchema,
  selectFlyerSchema
};
