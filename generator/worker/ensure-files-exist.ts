import { FileIdJson, fileIdJsonValues, fileMap } from "../def/file.js";
import { fileExists, writeFile } from "../lib/fs.js";

export function ensureMetaFilesExist() {
    for(const v of [...fileIdJsonValues]) {
        const id = v as FileIdJson
        const file = fileMap[id];
        if(!file.allowDefault || fileExists<typeof id>({ id }))
            continue;
        writeFile<typeof id>({ id }, file.defaultData);
    }
}