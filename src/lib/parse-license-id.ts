import { licenseIds } from "../generated/ids.js";
import { licenseIdSchema } from "../schema/index.js";
import type { LicenseId } from "../schema/index.js";

const lowerToCanonical = new Map<string, LicenseId>(
  licenseIds.map((id) => [id.toLowerCase(), id]),
);

export function parseLicenseId(
  input: string,
  options?: { caseSensitive?: boolean },
): ReturnType<typeof licenseIdSchema.safeParse> {
  const { caseSensitive = true } = options ?? {};

  if (!caseSensitive) {
    const canonical = lowerToCanonical.get(input.toLowerCase());
    if (canonical !== undefined) {
      return licenseIdSchema.safeParse(canonical);
    }
  }

  return licenseIdSchema.safeParse(input);
}
