import { execSync } from "child_process";
import fs from "fs";
import { rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

// ASCII color codes
const colors = {
  blue: "\x1b[34m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = process.cwd();
const distFolder = path.join(projectRoot, "dist");
const outputQuapp = path.join(projectRoot, "dist.quapp");

console.log(`${colors.blue}\n📦 Starting production build...${colors.reset}`);

try {
  // Step 1: Run the actual build command
  execSync("npm run build", { stdio: "inherit" });

  // Step 2: Verify dist folder exists
  if (!fs.existsSync(distFolder)) {
    console.error(`${colors.red}❌ Build folder 'dist/' not found!${colors.reset}`);
    process.exit(1);
  }

  // Step 3: Zip the dist folder
  const output = fs.createWriteStream(outputQuapp);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", async () => {
    console.log(`${colors.green}\n✅ Project built and compressed → ${colors.bold}dist.quapp${colors.reset}`);

    // Step 4: Delete the dist folder after successful zip
    try {
      await rm(distFolder, { recursive: true, force: true });
    } catch (removeErr) {
      console.warn(`${colors.yellow}⚠️ Issue while removing dist/: ${removeErr.message}${colors.reset}`);
    }
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(distFolder, false);
  await archive.finalize();
} catch (err) {
  console.error(`${colors.red}\n❌ Build failed: ${err.message}${colors.reset}`);
  process.exit(1);
}
