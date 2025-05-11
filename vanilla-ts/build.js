import { execSync } from "child_process";
import fs from "fs";
import { rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// ASCII color codes
const c = {
  blue: "\x1b[34m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = process.cwd();
const distFolder = path.join(projectRoot, "dist");
const outputQuapp = path.join(projectRoot, "dist.quapp");

console.log(`${c.blue}\n📦 Starting production build...${c.reset}`);

try {
  // Step 1: Run build
  execSync("npm run build", { stdio: "inherit" });

  // Step 2: Verify dist/ exists
  if (!fs.existsSync(distFolder)) {
    console.error(`${c.red}❌ Build folder 'dist/' not found!${c.reset}`);
    process.exit(1);
  }

  // Step 3: Zip the folder using system `zip` command
  execSync(`zip -r -9 ${outputQuapp} dist`, { stdio: "ignore" });

  console.log(`${c.green}\n✅ Project built and compressed → ${c.bold}dist.quapp${c.reset}`);

  // Step 4: Remove dist folder
  try {
    await rm(distFolder, { recursive: true, force: true });
  } catch (err) {
    console.warn(`${c.yellow}⚠️ Could not remove dist/: ${err.message}${c.reset}`);
  }

} catch (err) {
  console.error(`${c.red}\n❌ Build failed: ${err.message}${c.reset}`);
  process.exit(1);
}
