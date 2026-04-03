import { ChangedLicenses } from "../def/types.js";
import { readFile, writeFile } from "../lib/fs.js";
import { generateChangelogEntry, generateCommitMessage } from "../lib/changelog.js";
import { updateGithubOutputEnv } from "../lib/gh-env.js";

function updateChangelog(entry: string) {
    const curr = readFile({ id: "changelog" });
    const split = curr.split("## ");
    const updated = [split[0], entry, ...split.slice(1)];
    writeFile({ id: "changelog" }, updated.join("## "));
}

export function generateChangelogData(version: string, changes: ChangedLicenses) {
    updateChangelog(generateChangelogEntry(version, changes));
    updateGithubOutputEnv({
        has_changes: true,
        change_message: generateCommitMessage(version, changes),
        new_version: version,
    });
}
