const fs = require("fs");
const os = require("os");
const path = require("path");

const appRoot = __dirname;
const dataDir = path.join(appRoot, "_runtime");
const port = process.env.PORT || "3173";

fs.mkdirSync(dataDir, { recursive: true });

process.env.PORT = String(port);
process.env.LFM_STANDALONE = "1";
process.env.LFM_DB_ASSET_PATH = path.join(appRoot, "seed-data.sqlite");
process.env.LFM_DB_PATH = path.join(dataDir, "runtime-data.sqlite");
process.env.HISTORICAL_CACHE_DIR = path.join(dataDir, "historical-cache");

const app = require("./server/index");
const { initializeGame } = require("./server/game");

async function startStandaloneServer() {
  console.log("Standalone node bootstrap started");
  await initializeGame({ seedOnly: false });
  console.log("Standalone database initialized");
  app.listen(Number(port), "127.0.0.1", () => {
    console.log(`Legacy Football Manager standalone backend listening on http://127.0.0.1:${port}`);
  });
}

startStandaloneServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
