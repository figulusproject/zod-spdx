import { createHash } from "crypto";

export function hashData(data: any): string {
  const stringified =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return createHash("sha256").update(stringified).digest("hex");
}
