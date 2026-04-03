import z from "zod";

export const licenseSchema = z.object({
  reference: z.url(),
  isDeprecatedLicenseId: z.boolean(),
  detailsUrl: z.url(),
  referenceNumber: z.int(),
  name: z.string(),
  licenseId: z.string(),
  seeAlso: z.array(z.url()),
  isOsiApproved: z.boolean(),
});
export type License = z.infer<typeof licenseSchema>;
