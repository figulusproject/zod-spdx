import { encodeLicenseId } from "../../src/lib/id-encoding.js";
import { License, licenseSchema } from "../../src/schema/license.js";
import { readFile } from "./fs.js";

const importStr = `import { License } from "../../schema/index.js";\n\n`;
const exportStr = `export const `;
const typeDefStr = `: License = `;
const suffix = `;\n`;

export function licenseToTSConst(license: License): string {
    const { constName } = encodeLicenseId(license.licenseId);
    const prefix = importStr + exportStr + constName + typeDefStr;
    return prefix + JSON.stringify(license, null, 2) + suffix;
}

export function tsConstToLicense(tsConst: string): License {
    const importExportStr = importStr + exportStr;
    if (!tsConst.startsWith(importExportStr))
        throw new Error(`Failed to convert TS const to license object: Does not start with "${importExportStr}"`);

    const slice1 = tsConst.slice(importExportStr.length);

    if (!slice1.endsWith(suffix))
        throw new Error(`Failed to convert TS const to license object: Does not end with "${suffix}"`);

    const slice2 = slice1.slice(0, slice1.length - suffix.length);

    if (!slice2.includes(typeDefStr))
        throw new Error(`Failed to convert TS const to license object: Does not include "${typeDefStr}"`);

    const typeDefStrEnd = slice2.indexOf(typeDefStr) + typeDefStr.length;
    const slice3 = slice2.slice(typeDefStrEnd);

    const parseRes = licenseSchema.safeParse(JSON.parse(slice3));
    if (!parseRes.success)
        throw new Error(`Failed to convert TS const to license object: ${parseRes.error}`);

    return parseRes.data;
}

export function readLicenseFile(id: string): License {
    const { fileName: pathReplacement } = encodeLicenseId(id);
    return tsConstToLicense(readFile({ id: "src-licenses", pathReplacement }));
}

export function getLicenseChangedCols(curr: License, prev: License): (keyof License)[] {
    const prevValues = Object.values(prev);
    const currValues = Object.values(curr);
    if (prevValues.length !== currValues.length)
        throw new Error(`Failed to get changed cols for license "${curr.licenseId}": Previous version contains ${prevValues.length} cols, current version contains ${currValues.length} cols!`);

    const keys = Object.keys(curr) as (keyof License)[];
    return keys.filter((_, i) => {
        const v = currValues[i];
        const p = prevValues[i];
        return Array.isArray(v) && Array.isArray(p)
            ? JSON.stringify(v) !== JSON.stringify(p)
            : v !== p;
    });
}

export function generateIdArray(data: License[]): string {
    const ids = [...data]
        .sort((a, b) => a.licenseId.localeCompare(b.licenseId))
        .map((l) => `  "${l.licenseId}",`);
    return `export const licenseIds = [\n` + ids.join("\n") + `\n] as const;`;
}

export function generateLicensesIndexFile(data: License[]): string {
    const exports = [...data]
        .sort((a, b) => a.licenseId.localeCompare(b.licenseId))
        .map((l) => encodeLicenseId(l.licenseId))
        .map(({ constName, fileName }) => `export { ${constName} } from "./${fileName}.js";`);
    return exports.join("\n");
}

export function generateGeneratedIndexFile(): string {
    return `export * from "./licenses/index.js";\nexport { licenseIds } from "./ids.js";\n`
}
