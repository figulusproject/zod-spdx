import z from "zod";
import { licenseSchema } from "../../src/schema/license.js";

export const cacheSchema = z.object({
  currentHash: z.hex().length(64).nullable(),
  lastUpdate: z.iso.datetime().transform((str) => new Date(str)),
  lastCheck: z.iso.datetime().transform((str) => new Date(str)),
});
export type DataCache = z.infer<typeof cacheSchema>;

export const generatedCacheSchema = z
  .object({
    licenseId: z.string(),
    currentHash: z.hex().length(64),
    lastUpdate: z.iso.datetime().transform((str) => new Date(str)),
  })
  .array();
export type GeneratedCache = z.infer<typeof generatedCacheSchema>;

export const licenseFileSchema = z.object({
  licenseListVersion: z.string(),
  licenses: z.array(licenseSchema),
  releaseDate: z.iso.datetime(),
});

export const packageJsonSchema = z
  .object({
    name: z.literal("zod-spdx"),
    version: z.string(),
    description: z.string(),
    type: z.literal("module"),
    main: z.literal("dist/index.js"),
    scripts: z.record(z.string(), z.string()),
    repository: z.object({
      type: z.literal("git"),
      url: z.string().url(),
    }),
    author: z.literal("The Figulus Project"),
    license: z.literal("MIT"),
    dependencies: z.record(z.string(), z.string()),
    devDependencies: z.record(z.string(), z.string()),
    sideEffects: z.literal(false),
    exports: z.record(
      z.string(),
      z.object({
        import: z.string(),
        types: z.string(),
      }),
    ),
  })
  .passthrough();
