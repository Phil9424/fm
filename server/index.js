const express = require("express");
const cors = require("cors");
const path = require("path");
const {
  initializeGame,
  buildState,
  startNewGame,
  setLanguage,
  updateTactics,
  updateTicketPrice,
  upgradeStadium,
  sendTrainingCamp,
  buyPlayer,
  sellPlayer,
  respondToTransferOffer,
  saveGame,
  loadGame,
  exitToMenu,
  startLiveMatch,
  advanceLiveMatch,
  fastForwardLiveMatch,
  handleLiveAction,
} = require("./game");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

function asyncRoute(handler) {
  return async (request, response) => {
    try {
      await handler(request, response);
    } catch (error) {
      response.status(400).json({
        ok: false,
        error: error.message || "Unexpected error",
      });
    }
  };
}

app.get("/api/state", asyncRoute(async (_request, response) => {
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/new-game", asyncRoute(async (request, response) => {
  const { clubId, managerName, language } = request.body || {};
  const state = startNewGame(clubId, managerName, language);
  response.json({ ok: true, state });
}));

app.post("/api/language", asyncRoute(async (request, response) => {
  setLanguage(request.body?.language);
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/tactics", asyncRoute(async (request, response) => {
  updateTactics(request.body || {});
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/finance/ticket", asyncRoute(async (request, response) => {
  updateTicketPrice(request.body?.ticketPrice);
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/finance/stadium", asyncRoute(async (_request, response) => {
  upgradeStadium();
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/finance/camp", asyncRoute(async (request, response) => {
  sendTrainingCamp(request.body?.campId);
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/transfers/buy", asyncRoute(async (request, response) => {
  buyPlayer(Number(request.body?.playerId), Number(request.body?.proposedFee));
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/transfers/sell", asyncRoute(async (request, response) => {
  sellPlayer(Number(request.body?.playerId), Number(request.body?.askingPrice));
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/transfers/respond", asyncRoute(async (request, response) => {
  respondToTransferOffer(Number(request.body?.offerId), request.body?.action, Number(request.body?.counterFee));
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/save", asyncRoute(async (request, response) => {
  saveGame(request.body?.name);
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/load", asyncRoute(async (request, response) => {
  loadGame(Number(request.body?.saveId));
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/exit-menu", asyncRoute(async (_request, response) => {
  exitToMenu();
  response.json({ ok: true, state: buildState() });
}));

app.post("/api/match/start", asyncRoute(async (_request, response) => {
  const match = startLiveMatch();
  response.json({ ok: true, match, state: buildState() });
}));

app.post("/api/match/advance", asyncRoute(async (_request, response) => {
  const match = advanceLiveMatch();
  response.json({ ok: true, match, state: buildState() });
}));

app.post("/api/match/fast-forward", asyncRoute(async (_request, response) => {
  const match = fastForwardLiveMatch();
  response.json({ ok: true, match, state: buildState() });
}));

app.post("/api/match/action", asyncRoute(async (request, response) => {
  const match = handleLiveAction(request.body || {});
  response.json({ ok: true, match, state: buildState() });
}));

async function startServer() {
  const seedOnly = process.argv.includes("--seed-only");
  await initializeGame({ seedOnly });
  if (seedOnly) {
    process.exit(0);
  }

  app.listen(PORT, () => {
    console.log(`Legacy Football Manager is running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
