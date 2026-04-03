import { CONFIG } from "../def/config.js";
import { hashData } from "../lib/crypto.js";
import { writeFile } from "../lib/fs.js";
import { DataCache, licenseFileSchema } from "../def/schema.js";
import { License } from "../../src/schema/license.js";

const { LICENSE_URL, BYPASS_CACHING } = CONFIG;

export async function syncData(currentCache: DataCache, exitEarly: (code: number, msg: unknown) => void): Promise<License[]> {
  const fetchRes = await fetch(LICENSE_URL);
  if (fetchRes.status !== 200)
    throw new Error(
      `Failed to fetch licenses.json! Received status code ${fetchRes.status} with message "${fetchRes.statusText}"!`,
    );

  const jsonRes = await fetchRes.json();
  const parsedJson = licenseFileSchema.safeParse(jsonRes);
  if (!parsedJson.success)
    throw new Error(`Failed to parse licenses.json: ${parsedJson.error}`);

  const { data } = parsedJson;

  const latestHash = hashData(data);
  if (!BYPASS_CACHING && latestHash === currentCache.currentHash) {
    writeFile(
      { id: "meta-data-cache" },
      { ...currentCache, lastCheck: new Date() },
    );

    exitEarly(0, `Exiting early: Fetched data is identical to saved data!`);
  }

  const now = new Date();
  writeFile({ id: "meta-current-licenses" }, data);
  writeFile(
    { id: "meta-data-cache" },
    {
      currentHash: latestHash,
      lastUpdate: now,
      lastCheck: now,
    },
  );

  return data.licenses;
}
