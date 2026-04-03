import { rmDir, writeFile } from "./lib/fs.js";

function main() {
    rmDir({ id: "src-generated" });
    writeFile({ id: "meta-generated-cache" }, []);

    console.log("Purged generated package!");
    process.exit(0);
}

main();