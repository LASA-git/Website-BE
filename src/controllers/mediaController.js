const { createPresignedUploadUrl } = require("../services/s3Service");
const { asyncHandler } = require("../utils/asyncHandler");

const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "-");

const createUploadUrl = asyncHandler(async (req, res) => {
  const { folder, fileName, contentType } = req.validated.body;
  const safeFileName = sanitizeFileName(fileName);
  const key = `${folder}/${Date.now()}-${safeFileName}`;

  const result = await createPresignedUploadUrl({ key, contentType });
  return res.json(result);
});

module.exports = { createUploadUrl };
