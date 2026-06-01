const app = require("./app");
const { connectDatabase } = require("./config/database");
const { env } = require("./config/env");

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`LASA API listening on port ${env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
