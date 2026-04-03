import z, { ZodArray, ZodObject } from "zod";
import {
  cacheSchema,
  generatedCacheSchema,
  licenseFileSchema,
  packageJsonSchema,
} from "./schema.js";

interface DynamicPath {
  base: string;
  replace: string;
}

interface FileBase {
  path: string;
}
interface FileBaseDynamic {
  path: DynamicPath;
}
interface FilePlain extends FileBase {
  type: "plain";
}
interface FilePlainDynamic extends FileBaseDynamic {
  type: "plain-dynamic";
}
interface FileJsonBase extends FileBase {
  type: "json";
  schema: ZodObject | ZodArray<ZodObject>;
}
type FileJsonNoDefault = FileJsonBase & { allowDefault: false };
type FileJsonWithDefault<Id extends FileIdJson> = FileJsonBase & {
  allowDefault: true,
  defaultData: FileJsonContent<Id>,
};
type FileJson<Id extends FileIdJson> =
    Id extends "package-json" ? FileJsonNoDefault
  : Id extends "meta-current-licenses" ? FileJsonNoDefault
  : FileJsonWithDefault<Id>;

export type File<Id extends FileId> = Id extends FileIdJson
  ? FileJson<Id>
  : Id extends FileIdPlainDynamic
    ? FilePlainDynamic
    : FilePlain;

export const fileIdJsonValues = [
  "meta-data-cache",
  "meta-generated-cache",
  "meta-current-licenses",
  "package-json"
] as const;
const fileIdJsonSchema = z.enum(fileIdJsonValues);
export type FileIdJson = z.infer<typeof fileIdJsonSchema>;
export type FileIdPlain = "src-id-array" | "src-licenses-index" | "src-generated-index" | "changelog";
export type FileIdPlainDynamic = "src-licenses";
export type FileId = FileIdJson | FileIdPlain | FileIdPlainDynamic;

export type FileJsonContent<T extends FileIdJson> = T extends "meta-data-cache"
  ? z.infer<typeof cacheSchema>
  : T extends "meta-generated-cache"
    ? z.infer<typeof generatedCacheSchema>
    : T extends "meta-current-licenses"
      ? z.infer<typeof licenseFileSchema>
      : T extends "package-json"
        ? z.infer<typeof packageJsonSchema>
        : undefined;

export type FileContent<T extends FileId> = T extends FileIdJson
  ? FileJsonContent<T>
  : string;

export const fileMap: { [Id in FileId]: File<Id> } = {
  "meta-data-cache": {
    path: "meta/data-cache.json",
    type: "json",
    schema: cacheSchema,
    allowDefault: true,
    defaultData: {
      currentHash: null,
      lastUpdate: new Date(0),
      lastCheck: new Date(0),
    },

  },
  "meta-generated-cache": {
    path: "meta/generated-cache.json",
    type: "json",
    schema: generatedCacheSchema,
    allowDefault: true,
    defaultData: [],
  },
  "meta-current-licenses": {
    path: "meta/current-licenses.json",
    type: "json",
    schema: licenseFileSchema,
    allowDefault: false,
  },
  "package-json": {
    path: "package.json",
    type: "json",
    schema: packageJsonSchema,
    allowDefault: false,
  },
  "src-id-array": {
    path: "src/generated/ids.ts",
    type: "plain",
  },
  "src-licenses-index": {
    path: "src/generated/licenses/index.ts",
    type: "plain",
  },
  "src-generated-index": {
    path: "src/generated/index.ts",
    type: "plain",
  },
  "src-licenses": {
    path: {
      base: "src/generated/licenses/dynamic.ts",
      replace: "dynamic",
    },
    type: "plain-dynamic",
  },
  "changelog": {
    path: "CHANGELOG.md",
    type: "plain",
  }
};

export type Dir = {
  path: string;
};

export type DirId = "src-generated" | "src-generated-licenses";

export const dirMap: { [Id in DirId]: Dir } = {
  "src-generated": {
    path: "src/generated",
  }, 
  "src-generated-licenses": {
    path: "src/generated/licenses",
  },
};
