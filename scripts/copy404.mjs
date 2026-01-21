import fs from "fs";
import path from "path";

const dist = path.resolve("dist");
const src = path.join(dist, "index.html");
const dest = path.join(dist, "404.html");

if (!fs.existsSync(src)) {
  console.error("❌ dist/index.html not found. Run build first.");
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log("✅ Copied dist/index.html → dist/404.html");
