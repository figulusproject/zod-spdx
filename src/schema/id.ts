import z from "zod";
import { licenseIds } from "../generated/ids.js";

export const licenseIdSchema = z.enum(licenseIds);
export type LicenseId = z.infer<typeof licenseIdSchema>;
