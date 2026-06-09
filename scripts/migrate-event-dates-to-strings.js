const mongoose = require("mongoose");
const { connectDatabase } = require("../src/config/database");
const {
  toDateOnlyString,
  getYearFromDateOnlyString,
  getYearEndDateString
} = require("../src/utils/dateUtils");

const migrate = async () => {
  await connectDatabase();

  const collection = mongoose.connection.collection("events");
  const cursor = collection.find({}, { projection: { startDate: 1, endDate: 1, eventYear: 1 } });

  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    scanned += 1;

    const startDate = toDateOnlyString(doc.startDate);
    if (!startDate) {
      skipped += 1;
      console.warn(`Skipping event ${doc._id}: invalid startDate`);
      continue;
    }

    const year = getYearFromDateOnlyString(startDate);
    const endDate = getYearEndDateString(year);

    const needsStartDateUpdate = doc.startDate !== startDate;
    const needsEndDateUpdate = doc.endDate !== endDate;
    const needsYearUpdate = doc.eventYear !== year;

    if (!needsStartDateUpdate && !needsEndDateUpdate && !needsYearUpdate) {
      continue;
    }

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          startDate,
          endDate,
          eventYear: year
        }
      }
    );

    updated += 1;
  }

  console.log(`Migration complete. scanned=${scanned} updated=${updated} skipped=${skipped}`);
};

migrate()
  .catch((error) => {
    console.error("Date migration failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
