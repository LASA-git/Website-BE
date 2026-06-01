const { z } = require("zod");

const presignSchema = z.object({
  body: z.object({
    folder: z.string().min(1),
    fileName: z.string().min(1),
    contentType: z.string().min(1).optional()
  })
});

module.exports = { presignSchema };
