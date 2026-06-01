const { z } = require("zod");

const emptyToUndefined = (value) => (value === "" ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());
const ageNumber = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return value;
  }
  return Number(value);
}, z.number().int().min(1));

const createVolunteerSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(2),
      age: ageNumber,
      gender: z.string().min(1),
      phone: optionalString,
      email: optionalEmail,
      interests: z.array(z.string().min(1)).min(1)
    })
    .refine((data) => data.phone || data.email, {
      message: "Provide phone or email",
      path: ["phone"]
    })
});

module.exports = { createVolunteerSchema };
