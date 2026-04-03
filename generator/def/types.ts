import { License } from "../../src/schema/license.js";

type ConstructiveChangeBase = { license: License; hash: string };
export type AddedLicense = { type: "added" } & ConstructiveChangeBase;
export type RemovedLicense = { type: "removed"; id: string; name: string };
export type ModifiedLicense = { type: "modified"; changedCols: (keyof License)[] } & ConstructiveChangeBase;
export type LicenseChange = AddedLicense | RemovedLicense | ModifiedLicense;

export type ChangedLicenses = {
  added: AddedLicense[];
  removed: RemovedLicense[];
  modified: ModifiedLicense[];
  totalChanged: number;
};
