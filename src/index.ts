export {
  licenseSchema,
  licenseSchema as spdxLicenseSchema,
  licenseIdSchema,
  licenseIdSchema as spdxLicenseIdSchema,
} from "./schema/index.js";
export type {
  License,
  License as SPDXLicense,
  LicenseId,
  LicenseId as SPDXLicenseId,
} from "./schema/index.js";

export { getLicense, parseLicenseId } from "./lib/index.js";
