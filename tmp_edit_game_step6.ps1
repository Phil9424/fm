$path='server/game.js'
$text=Get-Content -Raw $path
$start=$text.IndexOf('function advanceLiveMatch(')
$end=$text.IndexOf('function handleLiveAction(', $start)
if($start -lt 0 -or $end -lt 0){throw 'advance/handle markers not found'}
$block=@"
function finalizeFinishedLiveMatch(row, state) {
  if (!state.roundProcessed) {
    const fixture = getFixtureById(row.fixture_id);
    applyMatchOutcome(fixture, state);
    simulateOtherFixturesForRound(fixture.round_no, fixture.id);
    progressKnockoutCompetitions(fixture.round_no);
    resolveTransferOffersForRound(fixture.round_no + 1);
    updateManagerAfterRound(fixture, state);
    if (fixture.round_no % 5 === 0) {
      refreshTransferMarket();
    }
    state.roundProcessed = true;
  }

  db.prepare("UPDATE live_match SET state_json = ?, is_active = 1 WHERE id = 1").run(JSON.stringify(state));
  return state;
}

function advanceLiveMatch() {
  const row = db.prepare("SELECT * FROM live_match WHERE id = 1 AND is_active = 1").get();
  if (!row) {
    throw new Error(localize("Сейчас нет матча в прямом эфире.", "No live match in progress."));
  }

  let state = JSON.parse(row.state_json);
  if (state.status === "finished") {
    return state;
  }

  state = simulateMinute(state);

  if (state.status === "finished") {
    return finalizeFinishedLiveMatch(row, state);
  }

  db.prepare("UPDATE live_match SET state_json = ? WHERE id = 1").run(JSON.stringify(state));
  return state;
}

function fastForwardLiveMatch() {
  const row = db.prepare("SELECT * FROM live_match WHERE id = 1 AND is_active = 1").get();
  if (!row) {
    throw new Error(localize("Сейчас нет матча в прямом эфире.", "No live match in progress."));
  }

  let state = JSON.parse(row.state_json);
  if (state.status !== "finished") {
    state = fastForwardMatch(state);
  }

  if (state.status === "finished") {
    return finalizeFinishedLiveMatch(row, state);
  }

  db.prepare("UPDATE live_match SET state_json = ? WHERE id = 1").run(JSON.stringify(state));
  return state;
}

function continueAfterMatch() {
  const row = db.prepare("SELECT * FROM live_match WHERE id = 1 AND is_active = 1").get();
  if (!row) {
    throw new Error(localize("Сейчас нет завершенного матча.", "No finished match to continue from."));
  }

  const state = JSON.parse(row.state_json);
  if (state.status !== "finished") {
    throw new Error(localize("Матч еще не закончился.", "The match is not finished yet."));
  }

  db.prepare("UPDATE live_match SET is_active = 0 WHERE id = 1").run();
}

"@
$newText=$text.Substring(0,$start)+$block+$text.Substring($end)
Set-Content -Path $path -Value $newText -Encoding UTF8
