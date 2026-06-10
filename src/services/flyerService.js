const OpenAI = require("openai");
const { env } = require("../config/env");
const { normalizeDateOnlyString, toDateOnlyString } = require("../utils/dateUtils");

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const buildFlyerPrompt = (event) => {
  const dateLabel = normalizeDateOnlyString(event.startDate) || toDateOnlyString(event.startDate) || "";

  const parts = [
    "Create a simple, modern, minimal event flyer.",
    "Use clean typography and generous whitespace.",
    "No logos or branding.",
    `Title: ${event.title}.`,
    event.description ? `Description: ${event.description}.` : "",
    event.location ? `Venue: ${event.location}.` : "",
    dateLabel ? `Date: ${dateLabel}.` : "",
    event.registrationLink ? `Registration URL: ${event.registrationLink}. Add a clear call to action to register.` : ""
  ].filter(Boolean);

  return parts.join(" ");
};

const generateFlyerImages = async (event) => {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const prompt = buildFlyerPrompt(event);

  const response = await client.images.generate({
    model: "gpt-image-2",
    prompt,
    size: "1024x1280",
    quality: "high",
    n: 2
  });

  return (response.data || []).map((item) => item.b64_json).filter(Boolean);
};

module.exports = { generateFlyerImages };
