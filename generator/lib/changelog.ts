import { ChangedLicenses } from "../def/types.js";

export function generateCommitMessage(version: string, changes: ChangedLicenses): string {
    const output: string[] = [`# Release v${version}:\n`];
    const { added, modified, removed, totalChanged } = changes;

    if (added.length > 0)
        output.push(`## Added (${added.length}): ${added.map((l) => `\n  - ${l.license.name}`).join("")}`);

    if (modified.length > 0)
        output.push(`## Modified (${modified.length}): ${modified.map((l) => `\n  - ${l.license.name} (updated ${l.changedCols.join(", ")})`).join("")}`);

    if (removed.length > 0)
        output.push(`## Removed (${removed.length}): ${removed.map((l) => `\n  - ${l.name}`).join("")}`);

    output.push(`\n## Total licenses changed: ${totalChanged}`);

    return output.join("\n");
}

export function generateChangelogEntry(version: string, changes: ChangedLicenses): string {
    const date = new Date().toISOString().slice(0, 10);
    const output: string[] = [`[${version}] — ${date}\n`];
    const { added, modified, removed } = changes;

    if (added.length > 0)
        output.push(`### Added${added.map((l) => `\n- ${l.license.name}`).join("")}`);

    if (modified.length > 0)
        output.push(`### Changed${modified.map((l) => `\n- ${l.license.name} (updated ${l.changedCols.join(", ")})`).join("")}`);

    if (removed.length > 0)
        output.push(`### Removed${removed.map((l) => `\n- ${l.name}`).join("")}`);

    output.push(`\n---\n\n`);

    return output.join("\n");
}
