import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DirId,
  dirMap,
  FileContent,
  FileId,
  FileIdPlainDynamic,
  fileMap,
} from "../def/file.js";

function resolvePath(relativePath: string): string {
  return resolve(import.meta.dirname, "../../", relativePath);
}

type BaseFSPathParams<Id extends FileId> = { id: Id };
interface DynamicFSPathParams<Id extends FileId> extends BaseFSPathParams<Id> {
  pathReplacement: string;
}
type FSPathParams<Id extends FileId> = Id extends FileIdPlainDynamic
  ? DynamicFSPathParams<Id>
  : BaseFSPathParams<Id>;

function getFileAndPathObj<Id extends FileId>(pathParams: FSPathParams<Id>) {
  const file = fileMap[pathParams.id];

  const normalizePath = () => {
    const { path } = file;
    if (typeof path === "string") return path;

    const replacement = (pathParams as DynamicFSPathParams<Id>).pathReplacement;
    return path.base.replaceAll(path.replace, replacement);
  };
  const normalizedPath = normalizePath();

  return {
    file,
    path: resolvePath(normalizedPath),
  };
}

function getDirAndPathObj(id: DirId) {
  const dir = dirMap[id];

  return {
    dir,
    path: resolvePath(dir.path),
  };
}

export function readFile<Id extends FileId>(
  pathParams: FSPathParams<Id>,
): FileContent<Id> {
  try {
    const { file, path } = getFileAndPathObj<Id>(pathParams);

    const buffer = readFileSync(path);
    const str = buffer.toString("utf-8");

    if (file.type === "plain" || file.type === "plain-dynamic")
      return str as FileContent<Id>;

    const parsed = file.schema.safeParse(JSON.parse(str));
    if (!parsed.success) throw parsed.error;
    return parsed.data as FileContent<Id>;
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

export function fileExists<Id extends FileId>(
  pathParams: FSPathParams<Id>,
): boolean {
  try {
    const { path } = getFileAndPathObj<Id>(pathParams);
    return existsSync(path);
  } catch (error) {
    throw new Error(`Failed to check if file exists: ${error}`);
  }
}

export function writeFile<Id extends FileId>(
  pathParams: FSPathParams<Id>,
  content: FileContent<Id>,
): void {
  try {
    const { path } = getFileAndPathObj(pathParams);

    const str =
      typeof content === "string" ? content : JSON.stringify(content, null, 2);

    writeFileSync(path, str);
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}

export function removeFile<Id extends FileId>(
  pathParams: FSPathParams<Id>,
): void {
  try {
    const { path } = getFileAndPathObj(pathParams);
    rmSync(path);
  } catch (error) {
    throw new Error(`Failed to remove file: ${error}`);
  }
}

export function mkDir(
  { id }: { id: DirId },
  params?: { recursive: boolean },
) {
  mkdirSync(
    getDirAndPathObj(id).path,
    params,
  );
}

export function rmDir({ id }: { id: DirId }) {
  rmSync(
    getDirAndPathObj(id).path,
    {
      recursive: true,
      force: true,
    }
  );
}
