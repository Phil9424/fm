const fs = require('fs');
const path = 'public/app.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('const FORMATION_SLOTS =')) {
  s = s.replace('const ui = {', `const FORMATION_SLOTS = {
  "4-4-2": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "F", "F"],
  "4-3-3": ["G", "D", "D", "D", "D", "M", "M", "M", "F", "F", "F"],
  "4-2-3-1": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "M", "F"],
  "4-1-4-1": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "M", "F"],
  "4-5-1": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "M", "F"],
  "3-5-2": ["G", "D", "D", "D", "M", "M", "M", "M", "M", "F", "F"],
  "3-4-3": ["G", "D", "D", "D", "M", "M", "M", "M", "F", "F", "F"],
  "5-3-2": ["G", "D", "D", "D", "D", "D", "M", "M", "M", "F", "F"],
  "5-4-1": ["G", "D", "D", "D", "D", "D", "M", "M", "M", "M", "F"],
  "4-1-2-1-2": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "F", "F"],
};

const ui = {`);
}

s = s.replace('language: localStorage.getItem("lfm-lang") || "ru",', 'language: "en",');
s = s.replace('showAllScorers: false,', 'showAllScorers: false,\n  selectedLineupSlot: null,');

s = s.replace(/function syncLanguageFromState\(\) \{[\s\S]*?\n\}/, `function syncLanguageFromState() {
  ui.language = "en";
  localStorage.setItem("lfm-lang", ui.language);
  refreshButton.textContent = t("refresh");
}`);

s = s.replace(/async function changeLanguage\(language\) \{[\s\S]*?\n\}/, `async function changeLanguage(_language) {
  ui.language = "en";
  localStorage.setItem("lfm-lang", ui.language);
  refreshButton.textContent = t("refresh");
  if (ui.state?.manager) {
    const payload = await api("/api/language", {
      method: "POST",
      body: JSON.stringify({ language: "en" }),
    });
    ui.state = payload.state;
  }
  render();
}`);

s = s.replace(/<select id="languageSelect">[\s\S]*?<\/select>/, `<select id="languageSelect">
            <option value="en" selected>EN</option>
          </select>`);

s = s.replace(/value="\$\{ui\.language === "ru" \? "[^"]+" : "Legacy Manager"\}"/, 'value="Legacy Manager"');
s = s.replace(/managerName: document\.getElementById\("managerName"\)\.value \|\| \(ui\.language === "ru" \? "[^"]+" : "Legacy Manager"\)/, 'managerName: document.getElementById("managerName").value || "Legacy Manager"');

s = s.replace(/\$\{match\.homeScore\}-\$\{match\.awayScore\}\$\{match\.resultNote \? ` • \$\{match\.resultNote\}` : ""\}/g, '${match.homeScore}-${match.awayScore}${match.resultNote ? ` | ${match.resultNote}` : ""}');
s = s.replace('temperature}°', 'temperature}�');

if (!s.includes('function findMobileSlotForPlayer')) {
  s = s.replace('function playerById(id) {\n  return allSquadPlayers().find((player) => player.id === id);\n}', `function playerById(id) {
  return allSquadPlayers().find((player) => player.id === id);
}

function findMobileSlotForPlayer(playerId) {
  const player = playerById(playerId);
  const slots = FORMATION_SLOTS[ui.state?.tactics?.formation] || FORMATION_SLOTS["4-4-2"];
  if (!player) {
    return 0;
  }

  const preferred = slots
    .map((slot, index) => ({ slot, index }))
    .filter((entry) => entry.slot === player.position)
    .map((entry) => entry.index);

  if (!preferred.length) {
    return 0;
  }

  let bestIndex = preferred[0];
  let bestOverall = Number.MAX_SAFE_INTEGER;
  for (const index of preferred) {
    const incumbent = playerById(ui.lineupDraft[index]);
    const overall = incumbent?.overall || 0;
    if (overall < bestOverall) {
      bestOverall = overall;
      bestIndex = index;
    }
  }
  return bestIndex;
}`);
}

s = s.replace(/<div class="drag-player" draggable="true" data-player-id="\$\{player\.id\}" data-source="lineup">\$\{player\.name\}<span>\$\{player\.position\} - \$\{player\.overall\}<\/span><\/div>/g,
'<div class="drag-player" draggable="true" data-player-id="${player.id}" data-source="lineup">${player.name}<span>${player.position} - ${player.overall}</span><button type="button" class="mini-button" data-to-pool="${player.id}">?</button></div>');

s = s.replace(/<div class="drag-player" draggable="true" data-player-id="\$\{player\.id\}" data-source="pool">\s*\$\{player\.name\}\s*<span>\$\{player\.position\} - \$\{player\.overall\}<\/span>\s*<\/div>/g,
'<div class="drag-player" draggable="true" data-player-id="${player.id}" data-source="pool">${player.name}<span>${player.position} - ${player.overall}</span><button type="button" class="mini-button" data-to-lineup="${player.id}">+</button></div>');

if (!s.includes('if (liveMatch.status === "finished")')) {
  s = s.replace('  if (liveMatch.status === "halftime") {', `  if (liveMatch.status === "finished") {
    const goals = (liveMatch.events || []).filter((event) => event.type === "goal");
    return \
    \`\n      <section class="card">\n        <p class="eyebrow">Match finished</p>\n        <div class="match-score">\n          <div><small>\${liveMatch.home.clubName}</small><div>\${liveMatch.score.home}</div></div>\n          <div>FT</div>\n          <div style="text-align:right"><small>\${liveMatch.away.clubName}</small><div>\${liveMatch.score.away}</div></div>\n        </div>\n        <div class="grid three">\n          <article class="stat-box"><span class="secondary">\${t("possession")}</span><strong>\${liveMatch.stats.home.possession}% - \${liveMatch.stats.away.possession}%</strong></article>\n          <article class="stat-box"><span class="secondary">\${t("shots")}</span><strong>\${liveMatch.stats.home.shots} - \${liveMatch.stats.away.shots}</strong></article>\n          <article class="stat-box"><span class="secondary">\${t("onTarget")}</span><strong>\${liveMatch.stats.home.shotsOnTarget} - \${liveMatch.stats.away.shotsOnTarget}</strong></article>\n        </div>\n      </section>\n\n      <section class="card">\n        <p class="eyebrow">Goals</p>\n        <div class="grid">\n          \${goals.length ? goals.map((goal) => \
            \`<div class="split"><span>\${goal.playerName}\${goal.assistName ? \` (assist: \${goal.assistName})\` : ""}</span><strong>\${goal.minute}'</strong></div>\`\
          ).join("") : \`<p class="secondary">\${t("noData")}</p>\`}\n        </div>\n        <div class="action-row">\n          <button id="continueAfterMatchButton" class="primary-button">Continue</button>\n        </div>\n      </section>\n    \`;
  }

  if (liveMatch.status === "halftime") {`);
}

s = s.replace('<button id="quickSimButton" class="ghost-button">${t("quickSim")}</button>', '<button id="advanceMatchButton" class="ghost-button">${t("continueMatch")}</button>\n        <button id="quickSimButton" class="ghost-button">${t("quickSim")}</button>');

s = s.replace('if (ui.tab === "squad") {\n    attachDragEvents();', `if (ui.tab === "squad") {\n    attachDragEvents();\n\n    document.querySelectorAll("[data-to-pool]").forEach((button) => {\n      button.addEventListener("click", () => {\n        moveToPool(Number(button.dataset.toPool));\n        render();\n      });\n    });\n\n    document.querySelectorAll("[data-to-lineup]").forEach((button) => {\n      button.addEventListener("click", () => {\n        const playerId = Number(button.dataset.toLineup);\n        moveToLineup(playerId, findMobileSlotForPlayer(playerId));\n        render();\n      });\n    });`);

s = s.replace('if (ui.tab === "match") {\n    document.getElementById("startMatchButton")?.addEventListener("click", async () => {', `if (ui.tab === "match") {\n    document.getElementById("continueAfterMatchButton")?.addEventListener("click", async () => {\n      try {\n        const payload = await api("/api/match/continue", { method: "POST" });\n        ui.state = payload.state;\n        ui.tab = "dashboard";\n        showToast(t("roundComplete"));\n        render();\n      } catch (error) {\n        showToast(error.message);\n      }\n    });\n\n    document.getElementById("advanceMatchButton")?.addEventListener("click", async () => {\n      try {\n        const payload = await api("/api/match/advance", { method: "POST" });\n        ui.state = payload.state;\n        render();\n      } catch (error) {\n        showToast(error.message);\n      }\n    });\n\n    document.getElementById("startMatchButton")?.addEventListener("click", async () => {`);

s = s.replace(/\n\s*if \(ui\.state\.liveMatch\?\.status === "live"\) \{\n\s*startLiveTicker\(\);\n\s*\}/g, '');

fs.writeFileSync(path, s, 'utf8');
