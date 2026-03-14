const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const serverDir = path.join(rootDir, "server");
const standaloneDir = path.join(rootDir, "standalone-node");
const publicNodeModulesDir = path.join(publicDir, "node_modules");
const publicServerDir = path.join(publicDir, "server");
const sourceDbPath = path.join(rootDir, "data.sqlite");
const seedDbPath = path.join(publicDir, "seed-data.sqlite");

function copyRecursive(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
}

function removeIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function run(command, args, options = {}) {
  const executable = process.platform === "win32" && command === "npm" ? "npm.cmd" : command;
  execFileSync(executable, args, {
    cwd: rootDir,
    shell: process.platform === "win32" && command === "npm",
    stdio: "inherit",
    ...options,
  });
}

function prepareStandaloneFiles() {
  removeIfExists(publicServerDir);
  copyRecursive(serverDir, publicServerDir);

  copyRecursive(path.join(standaloneDir, "nodejs-main.js"), path.join(publicDir, "nodejs-main.js"));
  copyRecursive(path.join(standaloneDir, "package.json"), path.join(publicDir, "package.json"));

  fs.mkdirSync(path.join(publicNodeModulesDir, "better-sqlite3"), { recursive: true });
  copyRecursive(
    path.join(standaloneDir, "better-sqlite3", "index.js"),
    path.join(publicNodeModulesDir, "better-sqlite3", "index.js")
  );
}

function installStandaloneDependencies() {
  run("npm", ["install", "--prefix", publicDir, "--omit=dev", "--no-package-lock"]);
}

function buildSeedDatabase() {
  const Database = require("better-sqlite3");

  if (!fs.existsSync(sourceDbPath)) {
    throw new Error(`Source database not found: ${sourceDbPath}`);
  }

  removeIfExists(seedDbPath);
  fs.copyFileSync(sourceDbPath, seedDbPath);

  const db = new Database(seedDbPath);
  db.exec(`
    DELETE FROM live_match;
    DELETE FROM transfer_offers;
    DELETE FROM finance_entries;
    DELETE FROM news_items;
    DELETE FROM manager_mail;
    DELETE FROM transfer_market;
    DELETE FROM fixtures;
    DELETE FROM club_tactics;
    DELETE FROM players;
    DELETE FROM clubs;
    DELETE FROM leagues;
    DELETE FROM manager;
    DELETE FROM save_slots;
    VACUUM;
  `);
  db.close();
}

function main() {
  run(process.execPath, [path.join(rootDir, "scripts", "patch_capacitor_nodejs.js")]);
  prepareStandaloneFiles();
  installStandaloneDependencies();
  prepareStandaloneFiles();
  buildSeedDatabase();
  console.log(`Standalone Android assets prepared in ${publicDir}`);
}

main();
