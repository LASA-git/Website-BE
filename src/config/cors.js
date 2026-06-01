const { env } = require("./env");

const normalizeOrigins = () => {
  if (!env.CORS_ORIGIN) {
    return true;
  }

  const origins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
  return origins;
};

const corsOptions = {
  origin: normalizeOrigins(),
  credentials: true
};

module.exports = { corsOptions };
