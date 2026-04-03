import { License } from "../../src/schema/license.js";
import { GeneratedCache } from "../def/schema.js";
import { AddedLicense, ChangedLicenses, ModifiedLicense, RemovedLicense } from "../def/types.js";
import { hashData } from "../lib/crypto.js";
import { writeFile } from "../lib/fs.js";
import { getLicenseChangedCols, readLicenseFile } from "../lib/typescript.js";

export function getChangedLicenses(
  currentLicenses: License[],
  cache: GeneratedCache,
): ChangedLicenses {
  const cachedMap = new Map(cache.map((l) => [l.licenseId, l.currentHash]));
  const currentIdSet = new Set(currentLicenses.map((l) => l.licenseId));
  const currentHashMap = new Map(
    currentLicenses.map((l) => [l.licenseId, hashData(l)]),
  );

  const addedLicenses = currentLicenses.filter((l) => !cachedMap.has(l.licenseId));
  const removedLicenses = cache.filter((l) => !currentIdSet.has(l.licenseId));
  const modifiedLicenses = currentLicenses.filter((l) => {
    const cachedHash = cachedMap.get(l.licenseId);
    if (cachedHash === undefined) return false;
    return currentHashMap.get(l.licenseId) !== cachedHash;
  });

  const added: AddedLicense[] = addedLicenses.map((l) => ({
    type: "added",
    license: l,
    hash: currentHashMap.get(l.licenseId)!,
  }));

  // MUST be run BEFORE the package is re-generated, becomes useless after
  const removed: RemovedLicense[] = removedLicenses.map((l) => ({
    type: "removed",
    id: l.licenseId,
    name: readLicenseFile(l.licenseId).name,
  }));

  const modified: ModifiedLicense[] = modifiedLicenses.map((l) => ({
    type: "modified",
    license: l,
    hash: currentHashMap.get(l.licenseId)!,
    changedCols: getLicenseChangedCols(l, readLicenseFile(l.licenseId)),
  }));

  const changed: ChangedLicenses = {
    added,
    removed,
    modified,
    totalChanged: added.length + removed.length + modified.length,
  };

  updateCache(cache, changed);

  return changed;
}

function updateCache(currentCache: GeneratedCache, changedLicenses: ChangedLicenses) {
  const lastUpdate = new Date();
  const removedIds = new Set(changedLicenses.removed.map((l) => l.id));
  const modifiedIds = new Set(changedLicenses.modified.map((l) => l.license.licenseId));

  const newCache: GeneratedCache = [
    ...currentCache.filter(
      (l) => !removedIds.has(l.licenseId) && !modifiedIds.has(l.licenseId),
    ),
    ...changedLicenses.added.map((l) => ({
      licenseId: l.license.licenseId,
      currentHash: l.hash,
      lastUpdate,
    })),
    ...changedLicenses.modified.map((l) => ({
      licenseId: l.license.licenseId,
      currentHash: l.hash,
      lastUpdate,
    })),
  ];

  writeFile({ id: "meta-generated-cache" }, newCache);
}
