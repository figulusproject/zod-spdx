import { encodeLicenseId } from "./id-encoding.js";
import type { License, LicenseId } from "../schema/index.js";

export async function getLicense(id: LicenseId): Promise<License> {
  const { constName, fileName } = encodeLicenseId(id);
  const mod = await import(`../generated/licenses/${fileName}.js`);
  return (mod as Record<string, License>)[constName];
}
