import z from "zod";
import { encodeLicenseId } from "../../src/lib/id-encoding.js";
import { mkDir, readFile, removeFile, writeFile } from "../lib/fs.js";
import { CONFIG } from "../def/config.js";
import { ChangedLicenses, RemovedLicense } from "../def/types.js";
import { generateGeneratedIndexFile, generateIdArray, generateLicensesIndexFile, licenseToTSConst } from "../lib/typescript.js";
import { License } from "../../src/schema/license.js";

function upsertLicenseFiles(data: License[]) {
  for (const license of data) {
    const { fileName } = encodeLicenseId(license.licenseId);
    writeFile({ id: "src-licenses", pathReplacement: fileName }, licenseToTSConst(license));
  }
}

function removeLicenseFiles(removedLicenses: RemovedLicense[]) {
  for (const license of removedLicenses) {
    const { fileName } = encodeLicenseId(license.id);
    removeFile({ id: "src-licenses", pathReplacement: fileName });
  }
}

function updatePackageVersion() {
  const currentFile = readFile({ id: "package-json" });
  const parsed = z
    .string()
    .regex(/^[0-9]+\.[0-9]+\.[0-9]+$/)
    .transform((str) => ({
      major: Number.parseInt(str.split(".")[0]),
      minor: Number.parseInt(str.split(".")[1]),
      patch: Number.parseInt(str.split(".")[2]),
    }))
    .safeParse(currentFile.version);

  if (!parsed.success)
    throw new Error(`Failed to updated package.json: ${parsed.error}`);

  const old = parsed.data;
  const bumpType = CONFIG.VERSION_BUMP_TYPE;

  const updated: typeof old = {
    major: bumpType === "major" ? old.major + 1 : old.major,
    minor: bumpType === "major" ? 0 : bumpType === "minor" ? old.minor + 1 : old.minor,
    patch: bumpType === "patch" ? old.patch + 1 : 0,
  };

  const version = Object.values(updated).join(".");
  writeFile({ id: "package-json" }, { ...currentFile, version });
  return version;
}

export function updateTSPackage(allLicenses: License[], changedLicenses: ChangedLicenses) {
  mkDir({ id: "src-generated-licenses" }, { recursive: true });

  writeFile({ id: "src-id-array" }, generateIdArray(allLicenses));

  removeLicenseFiles(changedLicenses.removed);

  upsertLicenseFiles([
    ...changedLicenses.added.map((l) => l.license),
    ...changedLicenses.modified.map((l) => l.license),
  ]);

  writeFile({ id: "src-licenses-index" }, generateLicensesIndexFile(allLicenses));
  writeFile({ id: "src-generated-index" }, generateGeneratedIndexFile());

  return updatePackageVersion();
}
