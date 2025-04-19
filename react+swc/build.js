import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import archiver from "archiver";

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = process.cwd();
const distFolder = path.join(projectRoot, "dist");
const outputQuapp = path.join(projectRoot, "dist.quapp");

console.log(chalk.blue("\n📦 Starting production build..."));

try {
  // Step 1: Run the actual build command
  execSync("npm run build", { stdio: "inherit" });

  // Step 2: Verify dist folder exists
  if (!fs.existsSync(distFolder)) {
    console.log(chalk.red("❌ Build folder 'dist/' not found!"));
    process.exit(1);
  }

  // Step 3: Zip the dist folder
  const output = fs.createWriteStream(outputQuapp);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", async () => {
    console.log(chalk.green(`\n✅ Project built and compressed → ${chalk.bold("dist.quapp")}`));

    // Step 4: Delete the dist folder after successful zip
    try {
      await fs.remove(distFolder);
    } catch (removeErr) {
      console.log(chalk.yellow("⚠️ having Issues :"), removeErr.message);
    }
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(distFolder, false);
  await archive.finalize();
} catch (err) {
  console.error(chalk.red("\n❌ Build failed:"), err.message);
  process.exit(1);
}
