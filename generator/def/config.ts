import "dotenv/config";
import z from "zod";

const rawSchema = {
  LICENSE_URL: z.url().default("https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/json/licenses.json"),
  COOLDOWN_MS: z.coerce.number().int().positive().default(24 * 60 * 60 * 1000),
  BYPASS_COOLDOWN: z.stringbool().default(false),
  BYPASS_CACHING: z.stringbool().default(false),
  BYPASS_FETCH: z.stringbool().default(false),
  VERSION_BUMP_TYPE: z.enum(["major", "minor", "patch"]).default("patch"),
  GITHUB_OUTPUT: z.string().nullable().default(null),
};

const zodSchema = z.object(rawSchema);

export const CONFIG = zodSchema.parse(
  Object.assign(
    {},
    ...Object.keys(rawSchema).map((key) => {
      const env = process.env[key];
      return env ? { [key]: env } : {};
    }),
  )
);
