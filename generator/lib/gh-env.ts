import { appendFileSync } from "node:fs";
import { CONFIG } from "../def/config.js";

type GithubEnv = {
    has_changes: true;
    new_version: string;
    change_message: string;
} | {
    has_changes: false;
    new_version: null;
    change_message: null;
};

function encodeValue(value: string): string {
    return value
        .replaceAll("%", "%25")
        .replaceAll("\r", "%0D")
        .replaceAll("\n", "%0A");
}

export function updateGithubOutputEnv(params: GithubEnv) {
    if (!CONFIG.GITHUB_OUTPUT) return;
    appendFileSync(
        CONFIG.GITHUB_OUTPUT,
        [
            `has_changes=${params.has_changes}`,
            `new_version=${params.new_version ?? ""}`,
            `change_message=${encodeValue(params.change_message ?? "")}`,
        ].join("\n") + "\n",
    );
}
