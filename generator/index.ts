import { CONFIG } from "./def/config.js";
import { fileExists, readFile } from "./lib/fs.js";
import { updateGithubOutputEnv } from "./lib/gh-env.js";
import { ensureMetaFilesExist } from "./worker/ensure-files-exist.js";
import { getChangedLicenses } from "./worker/generated-cache.js";
import { syncData } from "./worker/sync-data.js";
import { generateChangelogData } from "./worker/update-changelog.js";
import { updateTSPackage } from "./worker/update-package.js";

const { BYPASS_COOLDOWN, COOLDOWN_MS, BYPASS_FETCH } = CONFIG;

function exitEarly(code: number, message: unknown) {
  if(code > 0) console.error(message);
  else console.log(message);
  updateGithubOutputEnv({
    has_changes: false,
    new_version: null,
    change_message: null,
  });
  process.exit(code);
}

async function main() {
  try {
    ensureMetaFilesExist();

    const currentCache = readFile({ id: "meta-data-cache" });
    const msSinceLastCheck =
      new Date().getTime() - currentCache.lastCheck.getTime();
    if (!BYPASS_COOLDOWN && msSinceLastCheck < COOLDOWN_MS)
      exitEarly(0, `Exiting early: Last check was only ${Math.round(msSinceLastCheck / 1000)} seconds ago! Must be over ${COOLDOWN_MS / 1000}!`);

    const getLicenses = async () => {
      if (BYPASS_FETCH && fileExists({ id: "meta-current-licenses" }))
        return readFile({ id: "meta-current-licenses" }).licenses;
      return await syncData(currentCache, exitEarly);
    };

    const licenses = await getLicenses();

    const changed = getChangedLicenses(
      licenses,
      readFile({ id: "meta-generated-cache" }),
    );
    if (changed.totalChanged < 1)
      exitEarly(0, `Exiting early: No licenses have been changed!`);

    const newVersion = updateTSPackage(licenses, changed);
    generateChangelogData(newVersion, changed);

    console.log("Done!");
    process.exit(0);
  } catch (error) {
    exitEarly(1, error);
  }
}

await main();
