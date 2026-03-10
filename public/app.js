const app = document.getElementById("app");
const bottomNav = document.getElementById("bottomNav");
const refreshButton = document.getElementById("refreshButton");
const toast = document.getElementById("toast");

const I18N = {
  ru: {
    refresh: "Обновить",
    newCareer: "Новая карьера",
    chooseLeague: "1. Выбери лигу",
    chooseClub: "2. Выбери клуб",
    managerName: "Имя менеджера",
    startCareer: "Начать карьеру",
    load: "Загрузить",
    save: "Сохранить",
    exitMenu: "В меню",
    toolbar: "Меню карьеры",
    club: "Клуб",
    squad: "Состав",
    market: "Рынок",
    finance: "Финансы",
    season: "Сезон",
    match: "Матч",
    cash: "Деньги",
    ticket: "Билет",
    stadium: "Стадион",
    board: "Совет директоров",
    nextMatch: "Следующий матч",
    latestResults: "Итоги тура",
    tactics: "Тактика",
    formation: "Формация",
    mentality: "Менталитет",
    style: "Стиль",
    saveTactics: "Сохранить тактику",
    benchAndReserves: "Скамейка и резерв",
    transferMarket: "Трансферный рынок",
    outgoingSales: "Продажа игроков",
    yourOffers: "Переговоры",
    makeOffer: "Сделать предложение",
    listForSale: "Выставить",
    accept: "Принять",
    counter: "Контр-предложение",
    withdraw: "Отозвать",
    finances: "Финансы",
    wageBill: "Фонд зарплат",
    fanMood: "Настроение фанатов",
    ticketPrice: "Цена билета",
    applyTicketPrice: "Применить цену",
    expandStadium: "Расширить стадион",
    nextUpgrade: "Стоимость расширения",
    trainingCamps: "Тренировочные сборы",
    ledger: "Журнал операций",
    leagueTable: "Таблица лиги",
    topScorers: "Бомбардиры",
    calendar: "Календарь матчей",
    matchCenter: "Матч-центр",
    startMatch: "Начать матч",
    liveTactics: "Тактика по ходу игры",
    applyLiveTactics: "Применить по ходу матча",
    playerOut: "Кого снять",
    playerIn: "Кого выпустить",
    makeSubstitution: "Сделать замену",
    possession: "Владение",
    shots: "Удары",
    onTarget: "В створ",
    preMatchTalk: "Предматчевая речь",
    halftimeTalk: "Речь в перерыве",
    skipTalk: "Без речи",
    continueMatch: "Продолжить матч",
    opponent: "Соперник",
    yourTeam: "Твоя команда",
    date: "Дата",
    competition: "Турнир",
    weather: "Погода",
    referee: "Судья",
    attendance: "Ожидаемая посещаемость",
    lineups: "Стартовые составы",
    saveNamePrompt: "Название сохранения",
    noActiveSave: "Выбери сохранение из списка",
    created: "Карьера создана",
    tacticsSaved: "Тактика сохранена",
    ticketSaved: "Цена билета обновлена",
    stadiumUpgraded: "Стадион расширен",
    campBooked: "Сбор отправлен",
    offerSent: "Предложение отправлено",
    listedForSale: "Игрок выставлен",
    responseSent: "Ответ отправлен",
    gameSaved: "Игра сохранена",
    gameLoaded: "Сохранение загружено",
    exitedToMenu: "Возврат в меню",
    roundComplete: "Тур завершен",
    speechDone: "Речь сказана",
    substitutionDone: "Замена проведена",
    competitionStage: "Стадия",
    quickSim: "Быстрый расчет",
    showAll: "Показать всех",
    showLess: "Свернуть",
    noData: "Пока пусто",
    round: "Тур",
    player: "Игрок",
    clubName: "Клуб",
    overall: "Рейт",
    ask: "Запрос",
    value: "Цена",
    action: "Действие",
    goals: "Голы",
    recentResultsTitle: "Последние результаты",
    upcomingMatches: "Ближайшие матчи",
    eurocups: "Еврокубки",
    domesticCups: "Внутренние кубки",
    result: "Результат",
    fastFinished: "Матч досчитан",
  },
  en: {
    refresh: "Refresh",
    newCareer: "New career",
    chooseLeague: "1. Choose league",
    chooseClub: "2. Choose club",
    managerName: "Manager name",
    startCareer: "Start career",
    load: "Load",
    save: "Save",
    exitMenu: "Main menu",
    toolbar: "Career menu",
    club: "Club",
    squad: "Squad",
    market: "Market",
    finance: "Finance",
    season: "Season",
    match: "Match",
    cash: "Cash",
    ticket: "Ticket",
    stadium: "Stadium",
    board: "Board",
    nextMatch: "Next match",
    latestResults: "Round summary",
    tactics: "Tactics",
    formation: "Formation",
    mentality: "Mentality",
    style: "Style",
    saveTactics: "Save tactics",
    benchAndReserves: "Bench and reserves",
    transferMarket: "Transfer market",
    outgoingSales: "Outgoing sales",
    yourOffers: "Negotiations",
    makeOffer: "Submit offer",
    listForSale: "List for sale",
    accept: "Accept",
    counter: "Counter",
    withdraw: "Withdraw",
    finances: "Finances",
    wageBill: "Wage bill",
    fanMood: "Fan mood",
    ticketPrice: "Ticket price",
    applyTicketPrice: "Apply ticket price",
    expandStadium: "Expand stadium",
    nextUpgrade: "Upgrade cost",
    trainingCamps: "Training camps",
    ledger: "Ledger",
    leagueTable: "League table",
    topScorers: "Top scorers",
    calendar: "Match calendar",
    matchCenter: "Match center",
    startMatch: "Start match",
    liveTactics: "Live tactics",
    applyLiveTactics: "Apply live tactics",
    playerOut: "Player out",
    playerIn: "Player in",
    makeSubstitution: "Make substitution",
    possession: "Possession",
    shots: "Shots",
    onTarget: "On target",
    preMatchTalk: "Pre-match talk",
    halftimeTalk: "Half-time talk",
    skipTalk: "Skip talk",
    continueMatch: "Continue match",
    opponent: "Opponent",
    yourTeam: "Your team",
    date: "Date",
    competition: "Competition",
    weather: "Weather",
    referee: "Referee",
    attendance: "Estimated attendance",
    lineups: "Starting elevens",
    saveNamePrompt: "Save name",
    noActiveSave: "Choose a save slot first",
    created: "Career created",
    tacticsSaved: "Tactics saved",
    ticketSaved: "Ticket price updated",
    stadiumUpgraded: "Stadium expanded",
    campBooked: "Camp booked",
    offerSent: "Offer sent",
    listedForSale: "Player listed",
    responseSent: "Response sent",
    gameSaved: "Game saved",
    gameLoaded: "Save loaded",
    exitedToMenu: "Returned to menu",
    roundComplete: "Round complete",
    speechDone: "Team talk delivered",
    substitutionDone: "Substitution made",
    competitionStage: "Stage",
    quickSim: "Quick sim",
    showAll: "Show all",
    showLess: "Show less",
    noData: "No data yet",
    round: "Round",
    player: "Player",
    clubName: "Club",
    overall: "OVR",
    ask: "Ask",
    value: "Value",
    action: "Action",
    goals: "Goals",
    recentResultsTitle: "Recent results",
    upcomingMatches: "Upcoming matches",
    eurocups: "European cups",
    domesticCups: "Domestic cups",
    result: "Result",
    fastFinished: "Match fast-forwarded",
  },
};

const OPTION_LABELS = {
  mentality: {
    ultraDefensive: { ru: "Ультраоборонительный", en: "Ultra-defensive" },
    defensive: { ru: "Оборонительный", en: "Defensive" },
    balanced: { ru: "Сбалансированный", en: "Balanced" },
    positive: { ru: "Позитивный", en: "Positive" },
    attacking: { ru: "Атакующий", en: "Attacking" },
    allOut: { ru: "Ва-банк", en: "All-out" },
  },
  style: {
    possession: { ru: "Контроль мяча", en: "Possession" },
    tikiTaka: { ru: "Тики-така", en: "Tiki-taka" },
    direct: { ru: "Вертикальный", en: "Direct" },
    counter: { ru: "Контратаки", en: "Counter" },
    wingPlay: { ru: "Через фланги", en: "Wing play" },
    pressing: { ru: "Прессинг", en: "Pressing" },
    longBall: { ru: "Длинные передачи", en: "Long ball" },
  },
  competitionType: {
    league: { ru: "Лига", en: "League" },
    cup: { ru: "Кубок", en: "Cup" },
    champions: { ru: "Лига чемпионов", en: "Champions League" },
    uefa: { ru: "Кубок УЕФА", en: "UEFA Cup" },
  },
  status: {
    pending: { ru: "Ожидается", en: "Pending" },
    played: { ru: "Сыгран", en: "Played" },
    accepted: { ru: "Согласовано", en: "Accepted" },
    negotiating: { ru: "Торг", en: "Negotiating" },
    rejected: { ru: "Отказ", en: "Rejected" },
    withdrawn: { ru: "Отозвано", en: "Withdrawn" },
    completed: { ru: "Завершено", en: "Completed" },
  },
};

const ui = {
  tab: "dashboard",
  state: null,
  selectedLeague: null,
  selectedClubId: null,
  liveTicker: null,
  language: localStorage.getItem("lfm-lang") || "ru",
  lineupDraft: null,
  poolDraft: null,
  draggedPlayerId: null,
  showAllScorers: false,
};

function t(key) {
  return I18N[ui.language][key] || key;
}

function labelFor(group, value) {
  return OPTION_LABELS[group]?.[value]?.[ui.language] || value;
}

function competitionLabel(match) {
  const name = match.competitionName || match.competition_name || "";
  const stage = stageLabel(match.competitionStage || match.competition_stage || "");
  const type = labelFor("competitionType", match.competitionType || match.competition_type);
  const bits = [name || type, stage].filter(Boolean);
  return bits.join(" - ");
}

function statusLabel(status) {
  return labelFor("status", status);
}

function stageLabel(stage) {
  const labels = {
    "1/8 финала": { ru: "1/8 финала", en: "Round of 16" },
    "1/4 финала": { ru: "1/4 финала", en: "Quarter-final" },
    "1/2 финала": { ru: "1/2 финала", en: "Semi-final" },
    "Финал": { ru: "Финал", en: "Final" },
  };
  return labels[stage]?.[ui.language] || stage;
}

function money(value) {
  return new Intl.NumberFormat(ui.language === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat(ui.language === "ru" ? "ru-RU" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function badge(name, primary, secondary, tiny = false) {
  return `<div class="logo-badge ${tiny ? "tiny-badge" : ""}" style="background:linear-gradient(135deg, ${primary}, ${secondary})">${initials(name)}</div>`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 2400);
}

function syncLanguageFromState() {
  if (ui.state?.manager?.language) {
    ui.language = ui.state.manager.language;
  }
  localStorage.setItem("lfm-lang", ui.language);
  refreshButton.textContent = t("refresh");
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json();
  if (!payload.ok) {
    throw new Error(payload.error || (ui.language === "ru" ? "Запрос не выполнен" : "Request failed"));
  }
  return payload;
}

async function loadState() {
  const payload = await api("/api/state");
  ui.state = payload.state;
  syncLanguageFromState();
  render();
}

function leagueGroups(clubs) {
  return clubs.reduce((accumulator, club) => {
    const key = `${club.country}__${club.leagueName}`;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(club);
    return accumulator;
  }, {});
}

function ensureDraft() {
  if (!ui.state?.tactics) {
    return;
  }
  const key = `${ui.state.club.id}-${ui.state.tactics.starters.map((player) => player.id).join(",")}-${ui.state.tactics.bench.map((player) => player.id).join(",")}`;
  if (ui.draftKey === key) {
    return;
  }
  ui.draftKey = key;
  ui.lineupDraft = ui.state.tactics.starters.map((player) => player.id);
  ui.poolDraft = [...ui.state.tactics.bench, ...ui.state.tactics.reserves].map((player) => player.id);
}

function allSquadPlayers() {
  return [...ui.state.tactics.starters, ...ui.state.tactics.bench, ...ui.state.tactics.reserves];
}

function playerById(id) {
  return allSquadPlayers().find((player) => player.id === id);
}

async function changeLanguage(language) {
  ui.language = language === "en" ? "en" : "ru";
  localStorage.setItem("lfm-lang", ui.language);
  refreshButton.textContent = t("refresh");
  if (ui.state?.manager) {
    const payload = await api("/api/language", {
      method: "POST",
      body: JSON.stringify({ language: ui.language }),
    });
    ui.state = payload.state;
  }
  render();
}

function toolbarView() {
  return `
    <section class="card compact-card">
      <div class="split">
        <div>
          <p class="eyebrow">${t("toolbar")}</p>
          <strong>${ui.state?.club?.name || (ui.language === "ru" ? "Легендарный менеджер" : "Legacy Football Manager")}</strong>
        </div>
        <div class="toolbar-actions">
          <select id="languageSelect">
            <option value="ru" ${ui.language === "ru" ? "selected" : ""}>RU</option>
            <option value="en" ${ui.language === "en" ? "selected" : ""}>EN</option>
          </select>
          <button class="mini-button" id="saveButton">${t("save")}</button>
          <select id="saveSelect">
            <option value="">${t("load")}</option>
            ${(ui.state?.saveSlots || []).map((slot) => `<option value="${slot.id}">${slot.name}</option>`).join("")}
          </select>
          <button class="mini-button" id="loadButton">${t("load")}</button>
          <button class="mini-button" id="exitButton">${t("exitMenu")}</button>
        </div>
      </div>
    </section>
  `;
}

function renderSetup() {
  bottomNav.classList.add("hidden");
  const groups = leagueGroups(ui.state.clubs);
  const leagueKeys = Object.keys(groups);
  ui.selectedLeague = ui.selectedLeague || leagueKeys[0];
  const teams = groups[ui.selectedLeague] || [];
  ui.selectedClubId = ui.selectedClubId || teams[0]?.id;
  const [, leagueName] = ui.selectedLeague.split("__");

  app.innerHTML = `
    ${toolbarView()}
    <section class="setup-card">
      <p class="eyebrow">${t("newCareer")}</p>
      <h2 class="section-title">${t("chooseLeague")}</h2>
      <div class="league-grid">
        ${leagueKeys.map((leagueKey) => {
          const [country, name] = leagueKey.split("__");
          return `
            <button class="league-card ${ui.selectedLeague === leagueKey ? "active" : ""}" data-league-key="${leagueKey}">
              <strong>${country}</strong>
              <span>${name}</span>
            </button>
          `;
        }).join("")}
      </div>
      <h2 class="section-title" style="margin-top:14px">${t("chooseClub")}</h2>
      <div class="club-card-grid">
        ${teams.map((club) => `
          <button class="club-selection-card ${ui.selectedClubId === club.id ? "active" : ""}" data-club-id="${club.id}">
            <div class="cluster">
              ${badge(club.name, club.logoPrimary, club.logoSecondary)}
              <div>
                <strong>${club.name}</strong>
                <div class="secondary">${leagueName}</div>
                <div class="soft-pill">${club.boardExpectation}</div>
              </div>
            </div>
          </button>
        `).join("")}
      </div>
      <div class="field" style="margin-top:16px">
        <label>${t("managerName")}</label>
        <input id="managerName" value="${ui.language === "ru" ? "Легендарный менеджер" : "Legacy Manager"}" />
      </div>
      <div class="action-row">
        <button id="startCareerButton" class="primary-button">${t("startCareer")}</button>
      </div>
      ${(ui.state.saveSlots || []).length ? `
        <section class="card compact-card">
          <p class="eyebrow">${t("load")}</p>
          <div class="grid">
            ${ui.state.saveSlots.map((slot) => `
              <div class="split">
                <span>${slot.name}</span>
                <button class="mini-button" data-load-slot="${slot.id}">${t("load")}</button>
              </div>
            `).join("")}
          </div>
        </section>
      ` : ""}
    </section>
  `;
}

function dashboardView() {
  const { club, manager, board, nextFixture, roundSummary } = ui.state;
  return `
    <section class="hero-card" style="background:linear-gradient(135deg, ${club.logoPrimary}, ${club.logoSecondary})">
      <div class="hero-top">
        <div class="cluster">
          ${badge(club.name, club.logoPrimary, club.logoSecondary)}
          <div>
            <p class="eyebrow" style="color:rgba(255,255,255,0.72)">${t("club")}</p>
            <h2>${club.name}</h2>
            <div class="pill-row">
              <span class="pill">${club.country}</span>
              <span class="pill">${club.leagueName}</span>
              <span class="pill">#${club.rank}</span>
            </div>
          </div>
        </div>
        <div>
          <small>${t("board")}</small>
          <div style="font-size:34px;font-family:'Barlow Condensed',sans-serif">${manager.boardConfidence}</div>
        </div>
      </div>
      <p>${board.message}</p>
    </section>

    <section class="grid three">
      <article class="stat-box"><span class="secondary">${t("cash")}</span><strong>${money(manager.cash)}</strong></article>
      <article class="stat-box"><span class="secondary">${t("ticket")}</span><strong>${money(manager.ticketPrice)}</strong></article>
      <article class="stat-box"><span class="secondary">${t("stadium")}</span><strong>${manager.stadiumCapacity.toLocaleString(ui.language === "ru" ? "ru-RU" : "en-US")}</strong></article>
    </section>

    <section class="card">
      <div class="split">
        <div>
          <p class="eyebrow">${t("nextMatch")}</p>
          <h2 class="section-title">${nextFixture ? `${nextFixture.homeClubName} - ${nextFixture.awayClubName}` : "-"}</h2>
          ${nextFixture ? `
            <div class="grid">
              <div class="split"><span>${t("date")}</span><strong>${formatDate(nextFixture.match_date || nextFixture.matchDate)}</strong></div>
              <div class="split"><span>${t("competition")}</span><strong>${competitionLabel(nextFixture)}</strong></div>
            </div>
          ` : ""}
        </div>
        <button class="primary-button" data-open-tab="match">${t("matchCenter")}</button>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">${t("latestResults")}</p>
      <div class="grid">
        ${(roundSummary || []).length ? roundSummary.map((match) => `
          <div class="split">
            <span>${match.homeClubName}</span>
            <strong>${match.homeScore} - ${match.awayScore}</strong>
            <span>${match.awayClubName}</span>
          </div>
        `).join("") : `<p class="secondary">${t("noData")}</p>`}
      </div>
    </section>
  `;
}

function squadView() {
  ensureDraft();
  const poolPlayers = ui.poolDraft.map(playerById).filter(Boolean);
  return `
    <section class="card">
      <p class="eyebrow">${t("tactics")}</p>
      <div class="grid two">
        <div class="field">
          <label>${t("formation")}</label>
          <select id="formationSelect">${ui.state.tactics.formations.map((formation) => `<option ${formation === ui.state.tactics.formation ? "selected" : ""}>${formation}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>${t("mentality")}</label>
          <select id="mentalitySelect">${ui.state.tactics.mentalities.map((option) => `<option value="${option}" ${option === ui.state.tactics.mentality ? "selected" : ""}>${labelFor("mentality", option)}</option>`).join("")}</select>
        </div>
      </div>
      <div class="field">
        <label>${t("style")}</label>
        <select id="styleSelect">${ui.state.tactics.styles.map((option) => `<option value="${option}" ${option === ui.state.tactics.style ? "selected" : ""}>${labelFor("style", option)}</option>`).join("")}</select>
      </div>
      <div class="drag-layout">
        <div class="card compact-card">
          <p class="eyebrow">${t("yourTeam")}</p>
          <div class="drag-slot-list">
            ${ui.lineupDraft.map((playerId, index) => {
              const player = playerById(playerId);
              return `
                <div class="drag-slot" data-drop-type="lineup" data-drop-index="${index}">
                  ${player ? `<div class="drag-player" draggable="true" data-player-id="${player.id}" data-source="lineup">${player.name}<span>${player.position} - ${player.overall}</span></div>` : `<div class="drag-placeholder">#${index + 1}</div>`}
                </div>
              `;
            }).join("")}
          </div>
        </div>
        <div class="card compact-card">
          <p class="eyebrow">${t("benchAndReserves")}</p>
          <div class="drag-pool" data-drop-type="pool">
            ${poolPlayers.map((player) => `
              <div class="drag-player" draggable="true" data-player-id="${player.id}" data-source="pool">
                ${player.name}
                <span>${player.position} - ${player.overall}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
      <div class="action-row">
        <button id="saveTacticsButton" class="primary-button">${t("saveTactics")}</button>
      </div>
    </section>
  `;
}

function transfersView() {
  return `
    <section class="card">
      <p class="eyebrow">${t("transferMarket")}</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>${t("player")}</th><th>${t("clubName")}</th><th>${t("overall")}</th><th>${t("ask")}</th><th>${t("action")}</th></tr></thead>
          <tbody>
            ${ui.state.transferMarket.slice(0, 20).map((player) => `
              <tr>
                <td>${player.name}<br /><span class="secondary">${player.position} - ${player.nationality}</span></td>
                <td>${player.sellerClub}</td>
                <td>${player.overall}</td>
                <td>${money(player.askingPrice)}</td>
                <td>
                  <input class="offer-input" id="offer-${player.id}" type="number" value="${player.askingPrice}" />
                  <button class="mini-button" data-offer-player="${player.id}">${t("makeOffer")}</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">${t("outgoingSales")}</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>${t("player")}</th><th>${t("overall")}</th><th>${t("value")}</th><th>${t("action")}</th></tr></thead>
          <tbody>
            ${allSquadPlayers().map((player) => `
              <tr>
                <td>${player.name}</td>
                <td>${player.overall}</td>
                <td>${money(player.value)}</td>
                <td>
                  <input class="offer-input" id="sale-${player.id}" type="number" value="${player.value}" />
                  <button class="mini-button" data-sale-player="${player.id}">${t("listForSale")}</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">${t("yourOffers")}</p>
      <div class="grid">
        ${ui.state.transferOffers.length ? ui.state.transferOffers.map((offer) => `
          <div class="offer-card">
            <div class="split">
              <strong>${offer.playerName}</strong>
              <span class="soft-pill">${statusLabel(offer.status)}</span>
            </div>
            <div class="secondary">${offer.message || ""}</div>
            <div class="split">
              <span>${money(offer.proposed_fee || offer.proposedFee)}</span>
              ${offer.response_fee ? `<strong>${money(offer.response_fee)}</strong>` : ""}
            </div>
            ${["accepted", "negotiating"].includes(offer.status) ? `
              <div class="action-row">
                <button class="mini-button" data-offer-response="${offer.id}" data-action="accept">${t("accept")}</button>
                <input class="offer-input" id="counter-${offer.id}" type="number" value="${offer.response_fee || offer.proposed_fee}" />
                <button class="mini-button" data-offer-response="${offer.id}" data-action="counter">${t("counter")}</button>
                <button class="mini-button" data-offer-response="${offer.id}" data-action="withdraw">${t("withdraw")}</button>
              </div>
            ` : ""}
          </div>
        `).join("") : `<p class="secondary">${t("noData")}</p>`}
      </div>
    </section>
  `;
}

function financeView() {
  const { finance, manager } = ui.state;
  return `
    <section class="card">
      <p class="eyebrow">${t("finances")}</p>
      <div class="grid three">
        <article class="stat-box"><span class="secondary">${t("cash")}</span><strong>${money(manager.cash)}</strong></article>
        <article class="stat-box"><span class="secondary">${t("wageBill")}</span><strong>${money(finance.wageBill)}</strong></article>
        <article class="stat-box"><span class="secondary">${t("stadium")}</span><strong>${finance.stadiumCapacity.toLocaleString(ui.language === "ru" ? "ru-RU" : "en-US")}</strong></article>
      </div>
      <div class="split">
        <span>${t("nextUpgrade")}</span>
        <strong>${money(finance.nextUpgradeCost)}</strong>
      </div>
      <div class="field">
        <label>${t("ticketPrice")}</label>
        <div class="cluster">
          <input id="ticketRange" type="range" min="6" max="60" value="${manager.ticketPrice}" />
          <strong id="ticketValue">${money(manager.ticketPrice)}</strong>
        </div>
      </div>
      <div class="action-row">
        <button id="saveTicketButton" class="primary-button">${t("applyTicketPrice")}</button>
        <button id="upgradeStadiumButton" class="ghost-button">${t("expandStadium")}</button>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">${t("trainingCamps")}</p>
      <div class="grid">
        ${finance.camps.map((camp) => `
          <div class="split">
            <div>
              <strong>${camp.name}</strong>
              <div class="secondary">${camp.effect}</div>
            </div>
            <button class="mini-button" data-camp-id="${camp.id}">${money(camp.cost)}</button>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">${t("ledger")}</p>
      <div class="grid">
        ${finance.recentEntries.map((entry) => `
          <div class="split">
            <div>
              <strong>${entry.description}</strong>
              <div class="secondary">${t("round")} ${entry.roundNo}</div>
            </div>
            <strong style="color:${entry.amount >= 0 ? "var(--ok)" : "var(--danger)"}">${money(entry.amount)}</strong>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function competitionCards(cards) {
  return cards.length ? cards.map((card) => `
    <div class="offer-card">
      <div class="split">
        <strong>${card.name}</strong>
        <span class="soft-pill">${stageLabel(card.currentStage) || "-"}</span>
      </div>
      <div class="secondary">${t("upcomingMatches")}</div>
      <div class="grid">
        ${card.nextFixtures.length ? card.nextFixtures.map((match) => `
          <div class="split">
            <span>${match.homeClubName} - ${match.awayClubName}</span>
            <strong>${formatDate(match.matchDate)}</strong>
          </div>
        `).join("") : `<div class="secondary">${t("noData")}</div>`}
      </div>
      <div class="secondary">${t("recentResultsTitle")}</div>
      <div class="grid">
        ${card.recentResults.length ? card.recentResults.map((match) => `
          <div class="split">
            <span>${match.homeClubName} - ${match.awayClubName}</span>
            <strong>${match.homeScore}-${match.awayScore}${match.resultNote ? ` • ${match.resultNote}` : ""}</strong>
          </div>
        `).join("") : `<div class="secondary">${t("noData")}</div>`}
      </div>
    </div>
  `).join("") : `<p class="secondary">${t("noData")}</p>`;
}

function seasonView() {
  const scorers = ui.showAllScorers ? ui.state.topScorers : ui.state.topScorers.slice(0, 5);
  return `
    <section class="card">
      <p class="eyebrow">${t("leagueTable")}</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>${ui.language === "ru" ? "Клуб" : "Club"}</th><th>${ui.language === "ru" ? "И" : "P"}</th><th>${ui.language === "ru" ? "РМ" : "GD"}</th><th>${ui.language === "ru" ? "О" : "Pts"}</th></tr></thead>
          <tbody>
            ${ui.state.leagueTable.map((row) => `
              <tr>
                <td>${row.rank}</td>
                <td>${row.clubName}</td>
                <td>${row.played}</td>
                <td>${row.goalDifference}</td>
                <td><strong>${row.points}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">${t("topScorers")}</p>
      <div class="grid">
        ${scorers.length ? scorers.map((player) => `
          <div class="split">
            <span>${player.name} <span class="secondary">(${player.clubName})</span></span>
            <strong>${player.goals}</strong>
          </div>
        `).join("") : `<p class="secondary">${t("noData")}</p>`}
      </div>
      ${ui.state.topScorers.length > 5 ? `
        <div class="action-row">
          <button id="toggleScorersButton" class="ghost-button">${ui.showAllScorers ? t("showLess") : t("showAll")}</button>
        </div>
      ` : ""}
    </section>

    <section class="card">
      <p class="eyebrow">${t("eurocups")}</p>
      <div class="grid">
        ${competitionCards(ui.state.competitionOverview?.europe || [])}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">${t("domesticCups")}</p>
      <div class="grid">
        ${competitionCards(ui.state.competitionOverview?.domesticCups || [])}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">${t("calendar")}</p>
      <div class="grid">
        ${ui.state.calendar.map((match) => `
          <div class="split">
            <div>
              <strong>${formatDate(match.matchDate)}</strong>
              <div class="secondary">${competitionLabel(match)}</div>
              <div class="secondary">${match.homeClubName} - ${match.awayClubName}</div>
            </div>
            <span class="soft-pill">${match.status === "played" ? `${match.homeScore}-${match.awayScore}${match.resultNote ? ` | ${match.resultNote}` : ""}` : `${t("round")} ${match.roundNo}`}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderTalkOptions(stage, options) {
  return `
    <div class="grid">
      ${(options || []).map((option) => `
        <button class="talk-option" data-talk-stage="${stage}" data-talk-id="${option.id}">
          ${ui.language === "ru" ? option.ru : option.en}
        </button>
      `).join("")}
      <button class="ghost-button" data-talk-skip="${stage}">${t("skipTalk")}</button>
    </div>
  `;
}

function matchView() {
  const { liveMatch, nextFixture } = ui.state;
  if (!liveMatch) {
    return `
      <section class="card">
        <p class="eyebrow">${t("matchCenter")}</p>
        ${nextFixture ? `
          <h2 class="section-title">${nextFixture.homeClubName} - ${nextFixture.awayClubName}</h2>
          <div class="grid two">
            <div class="card compact-card">
              <div class="split"><span>${t("date")}</span><strong>${formatDate(nextFixture.match_date || nextFixture.matchDate)}</strong></div>
              <div class="split"><span>${t("competition")}</span><strong>${competitionLabel(nextFixture)}</strong></div>
              <div class="split"><span>${t("weather")}</span><strong>${ui.language === "ru" ? (nextFixture.weather?.ru || nextFixture.weather?.en || "-") : (nextFixture.weather?.en || nextFixture.weather?.ru || "-")}</strong></div>
              <div class="split"><span>${t("referee")}</span><strong>${nextFixture.referee || "-"}</strong></div>
              <div class="split"><span>${t("attendance")}</span><strong>${(nextFixture.attendance_estimate || nextFixture.attendanceEstimate || 0).toLocaleString(ui.language === "ru" ? "ru-RU" : "en-US")}</strong></div>
            </div>
            <div class="card compact-card">
              <strong>${t("lineups")}</strong>
              <div class="lineup-columns">
                <div>
                  <div class="secondary">${t("yourTeam")}</div>
                  ${(nextFixture.home_club_id === ui.state.club.id ? nextFixture.homeLineup : nextFixture.awayLineup).map((player) => `<div>${player.name} <span class="secondary">${player.position}</span></div>`).join("")}
                </div>
                <div>
                  <div class="secondary">${t("opponent")}</div>
                  ${(nextFixture.home_club_id === ui.state.club.id ? nextFixture.awayLineup : nextFixture.homeLineup).map((player) => `<div>${player.name} <span class="secondary">${player.position}</span></div>`).join("")}
                </div>
              </div>
            </div>
          </div>
          <div class="action-row">
            <button id="startMatchButton" class="primary-button">${t("startMatch")}</button>
          </div>
        ` : `<p class="secondary">...</p>`}
      </section>
    `;
  }

  const humanSide = liveMatch.matchContext.humanSide;
  const yourTeam = liveMatch[humanSide];
  const opponent = liveMatch[humanSide === "home" ? "away" : "home"];

  if (liveMatch.status === "pregame") {
    return `
      <section class="card">
        <p class="eyebrow">${t("preMatchTalk")}</p>
        <h2 class="section-title">${liveMatch.home.clubName} - ${liveMatch.away.clubName}</h2>
        <div class="grid two">
          <div class="card compact-card">
            <div class="split"><span>${t("date")}</span><strong>${formatDate(liveMatch.matchContext.matchDate)}</strong></div>
            <div class="split"><span>${t("competition")}</span><strong>${competitionLabel(liveMatch.matchContext)}</strong></div>
            <div class="split"><span>${t("weather")}</span><strong>${ui.language === "ru" ? liveMatch.matchContext.weather.ru : liveMatch.matchContext.weather.en}, ${liveMatch.matchContext.weather.temperature}°</strong></div>
            <div class="split"><span>${t("referee")}</span><strong>${liveMatch.matchContext.referee}</strong></div>
            <div class="split"><span>${t("attendance")}</span><strong>${liveMatch.matchContext.attendanceEstimate.toLocaleString(ui.language === "ru" ? "ru-RU" : "en-US")}</strong></div>
          </div>
          <div class="card compact-card">
            <div class="split"><span>${t("yourTeam")}</span><strong>${yourTeam.formation} / ${labelFor("style", yourTeam.style)}</strong></div>
            <div class="split"><span>${t("opponent")}</span><strong>${opponent.formation} / ${labelFor("style", opponent.style)}</strong></div>
            <div class="lineup-columns">
              <div>
                <div class="secondary">${t("yourTeam")}</div>
                ${yourTeam.starters.map((player) => `<div>${player.name} <span class="secondary">${player.position}</span></div>`).join("")}
              </div>
              <div>
                <div class="secondary">${t("opponent")}</div>
                ${opponent.starters.map((player) => `<div>${player.name} <span class="secondary">${player.position}</span></div>`).join("")}
              </div>
            </div>
          </div>
        </div>
        <div class="action-row">
          <button id="quickSimButton" class="ghost-button">${t("quickSim")}</button>
        </div>
        ${renderTalkOptions("pregame", liveMatch.preMatchSpeechOptions)}
      </section>
    `;
  }

  if (liveMatch.status === "halftime") {
    return `
      <section class="card">
        <p class="eyebrow">${t("halftimeTalk")}</p>
        <div class="match-score">
          <div><small>${liveMatch.home.clubName}</small><div>${liveMatch.score.home}</div></div>
          <div>45'</div>
          <div style="text-align:right"><small>${liveMatch.away.clubName}</small><div>${liveMatch.score.away}</div></div>
        </div>
        <div class="action-row">
          <button id="quickSimButton" class="ghost-button">${t("quickSim")}</button>
        </div>
        ${renderTalkOptions("halftime", liveMatch.halfTimeSpeechOptions)}
      </section>
    `;
  }

  return `
    <section class="card">
      <p class="eyebrow">${t("matchCenter")}</p>
      <div class="match-score">
        <div><small>${liveMatch.home.clubName}</small><div>${liveMatch.score.home}</div></div>
        <div>${liveMatch.minute}'</div>
        <div style="text-align:right"><small>${liveMatch.away.clubName}</small><div>${liveMatch.score.away}</div></div>
      </div>
      <div class="grid three">
        <article class="stat-box"><span class="secondary">${t("possession")}</span><strong>${liveMatch.stats.home.possession}% - ${liveMatch.stats.away.possession}%</strong></article>
        <article class="stat-box"><span class="secondary">${t("shots")}</span><strong>${liveMatch.stats.home.shots} - ${liveMatch.stats.away.shots}</strong></article>
        <article class="stat-box"><span class="secondary">${t("onTarget")}</span><strong>${liveMatch.stats.home.shotsOnTarget} - ${liveMatch.stats.away.shotsOnTarget}</strong></article>
      </div>
      <div class="grid two">
        <div class="card compact-card">
          <div class="split"><span>${t("yourTeam")}</span><strong>${yourTeam.formation} / ${labelFor("mentality", yourTeam.mentality)} / ${labelFor("style", yourTeam.style)}</strong></div>
          <div class="split"><span>${t("opponent")}</span><strong>${opponent.formation} / ${labelFor("mentality", opponent.mentality)} / ${labelFor("style", opponent.style)}</strong></div>
        </div>
        <div class="card compact-card">
          <div class="split"><span>${t("date")}</span><strong>${formatDate(liveMatch.matchContext.matchDate)}</strong></div>
          <div class="split"><span>${t("competition")}</span><strong>${competitionLabel(liveMatch.matchContext)}</strong></div>
          <div class="split"><span>${t("weather")}</span><strong>${ui.language === "ru" ? liveMatch.matchContext.weather.ru : liveMatch.matchContext.weather.en}</strong></div>
          <div class="split"><span>${t("referee")}</span><strong>${liveMatch.matchContext.referee}</strong></div>
        </div>
      </div>
      <div class="commentary">
        ${liveMatch.commentary.slice().reverse().map((line) => `<div class="commentary-line"><strong>${line.minute}'</strong> ${line.text}</div>`).join("")}
      </div>
      <div class="grid two">
        <div class="field">
          <label>${t("formation")}</label>
          <select id="liveFormationSelect">${ui.state.tactics.formations.map((option) => `<option ${option === yourTeam.formation ? "selected" : ""}>${option}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>${t("mentality")}</label>
          <select id="liveMentalitySelect">${ui.state.tactics.mentalities.map((option) => `<option value="${option}" ${option === yourTeam.mentality ? "selected" : ""}>${labelFor("mentality", option)}</option>`).join("")}</select>
        </div>
      </div>
      <div class="field">
        <label>${t("style")}</label>
        <select id="liveStyleSelect">${ui.state.tactics.styles.map((option) => `<option value="${option}" ${option === yourTeam.style ? "selected" : ""}>${labelFor("style", option)}</option>`).join("")}</select>
      </div>
      <div class="action-row">
        <button id="applyLiveTacticsButton" class="ghost-button">${t("applyLiveTactics")}</button>
        <button id="quickSimButton" class="ghost-button">${t("quickSim")}</button>
      </div>
      <div class="grid two">
        <div class="field">
          <label>${t("playerOut")}</label>
          <select id="subOutSelect">${yourTeam.starters.map((player) => `<option value="${player.id}">${player.name}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>${t("playerIn")}</label>
          <select id="subInSelect">${yourTeam.bench.map((player) => `<option value="${player.id}">${player.name}</option>`).join("")}</select>
        </div>
      </div>
      <div class="action-row">
        <button id="makeSubButton" class="primary-button">${t("makeSubstitution")}</button>
      </div>
    </section>
  `;
}

function attachToolbarEvents() {
  document.getElementById("languageSelect")?.addEventListener("change", (event) => {
    changeLanguage(event.target.value).catch((error) => showToast(error.message));
  });

  document.getElementById("saveButton")?.addEventListener("click", async () => {
    const name = window.prompt(t("saveNamePrompt"), `${t("round")} ${ui.state?.manager?.currentRound || 1}`);
    if (!name) {
      return;
    }
    try {
      const payload = await api("/api/save", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      ui.state = payload.state;
      showToast(t("gameSaved"));
      render();
    } catch (error) {
      showToast(error.message);
    }
  });

  document.getElementById("loadButton")?.addEventListener("click", () => {
    const saveId = Number(document.getElementById("saveSelect")?.value);
    if (!saveId) {
      showToast(t("noActiveSave"));
      return;
    }
    doLoad(saveId);
  });

  document.getElementById("exitButton")?.addEventListener("click", async () => {
    try {
      const payload = await api("/api/exit-menu", { method: "POST" });
      ui.state = payload.state;
      showToast(t("exitedToMenu"));
      render();
    } catch (error) {
      showToast(error.message);
    }
  });
}

function attachCommonEvents() {
  document.querySelectorAll("[data-open-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      ui.tab = button.dataset.openTab;
      render();
    });
  });

  document.querySelectorAll("[data-league-key]").forEach((button) => {
    button.addEventListener("click", () => {
      ui.selectedLeague = button.dataset.leagueKey;
      ui.selectedClubId = leagueGroups(ui.state.clubs)[ui.selectedLeague][0]?.id || null;
      render();
    });
  });

  document.querySelectorAll("[data-club-id]").forEach((button) => {
    button.addEventListener("click", () => {
      ui.selectedClubId = Number(button.dataset.clubId);
      render();
    });
  });

  document.querySelectorAll("[data-load-slot]").forEach((button) => {
    button.addEventListener("click", () => doLoad(Number(button.dataset.loadSlot)));
  });

  document.getElementById("startCareerButton")?.addEventListener("click", async () => {
    try {
      const payload = await api("/api/new-game", {
        method: "POST",
        body: JSON.stringify({
          clubId: ui.selectedClubId,
          managerName: document.getElementById("managerName").value || (ui.language === "ru" ? "Легендарный менеджер" : "Legacy Manager"),
          language: ui.language,
        }),
      });
      ui.state = payload.state;
      syncLanguageFromState();
      ui.tab = "dashboard";
      showToast(t("created"));
      render();
    } catch (error) {
      showToast(error.message);
    }
  });
}

function moveToLineup(playerId, targetIndex) {
  const existingIndex = ui.lineupDraft.indexOf(playerId);
  if (existingIndex !== -1) {
    ui.lineupDraft.splice(existingIndex, 1);
  } else {
    ui.poolDraft = ui.poolDraft.filter((id) => id !== playerId);
  }
  const displaced = ui.lineupDraft[targetIndex];
  ui.lineupDraft[targetIndex] = playerId;
  if (displaced && displaced !== playerId) {
    ui.poolDraft.push(displaced);
  }
}

function moveToPool(playerId) {
  ui.lineupDraft = ui.lineupDraft.filter((id) => id !== playerId);
  if (!ui.poolDraft.includes(playerId)) {
    ui.poolDraft.push(playerId);
  }
  while (ui.lineupDraft.length < 11 && ui.poolDraft.length) {
    ui.lineupDraft.push(ui.poolDraft.shift());
  }
}

function attachDragEvents() {
  document.querySelectorAll(".drag-player").forEach((item) => {
    item.addEventListener("dragstart", () => {
      ui.draggedPlayerId = Number(item.dataset.playerId);
    });
  });

  document.querySelectorAll("[data-drop-type]").forEach((target) => {
    target.addEventListener("dragover", (event) => event.preventDefault());
    target.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!ui.draggedPlayerId) {
        return;
      }
      if (target.dataset.dropType === "lineup") {
        moveToLineup(ui.draggedPlayerId, Number(target.dataset.dropIndex));
      } else {
        moveToPool(ui.draggedPlayerId);
      }
      ui.draggedPlayerId = null;
      render();
    });
  });
}

function stopLiveTicker() {
  clearInterval(ui.liveTicker);
  ui.liveTicker = null;
}

function startLiveTicker() {
  stopLiveTicker();
  ui.liveTicker = setInterval(async () => {
    try {
      const payload = await api("/api/match/advance", { method: "POST" });
      ui.state = payload.state;
      render();
      if (!ui.state.liveMatch || ui.state.liveMatch.status !== "live") {
        stopLiveTicker();
        if (!ui.state.liveMatch) {
          showToast(t("roundComplete"));
        }
      }
    } catch (error) {
      stopLiveTicker();
      showToast(error.message);
    }
  }, 1000);
}

async function doLoad(saveId) {
  try {
    const payload = await api("/api/load", {
      method: "POST",
      body: JSON.stringify({ saveId }),
    });
    ui.state = payload.state;
    syncLanguageFromState();
    showToast(t("gameLoaded"));
    render();
  } catch (error) {
    showToast(error.message);
  }
}

function attachTabEvents() {
  if (ui.tab === "squad") {
    attachDragEvents();
    document.getElementById("saveTacticsButton")?.addEventListener("click", async () => {
      try {
        const payload = await api("/api/tactics", {
          method: "POST",
          body: JSON.stringify({
            formation: document.getElementById("formationSelect").value,
            mentality: document.getElementById("mentalitySelect").value,
            style: document.getElementById("styleSelect").value,
            starters: ui.lineupDraft,
            bench: ui.poolDraft.slice(0, 7),
          }),
        });
        ui.state = payload.state;
        showToast(t("tacticsSaved"));
        render();
      } catch (error) {
        showToast(error.message);
      }
    });
  }

  if (ui.tab === "transfers") {
    document.querySelectorAll("[data-offer-player]").forEach((button) => {
      button.addEventListener("click", async () => {
        const playerId = Number(button.dataset.offerPlayer);
        const proposedFee = Number(document.getElementById(`offer-${playerId}`).value);
        try {
          const payload = await api("/api/transfers/buy", {
            method: "POST",
            body: JSON.stringify({ playerId, proposedFee }),
          });
          ui.state = payload.state;
          showToast(t("offerSent"));
          render();
        } catch (error) {
          showToast(error.message);
        }
      });
    });

    document.querySelectorAll("[data-sale-player]").forEach((button) => {
      button.addEventListener("click", async () => {
        const playerId = Number(button.dataset.salePlayer);
        const askingPrice = Number(document.getElementById(`sale-${playerId}`).value);
        try {
          const payload = await api("/api/transfers/sell", {
            method: "POST",
            body: JSON.stringify({ playerId, askingPrice }),
          });
          ui.state = payload.state;
          showToast(t("listedForSale"));
          render();
        } catch (error) {
          showToast(error.message);
        }
      });
    });

    document.querySelectorAll("[data-offer-response]").forEach((button) => {
      button.addEventListener("click", async () => {
        const offerId = Number(button.dataset.offerResponse);
        const action = button.dataset.action;
        const counterInput = document.getElementById(`counter-${offerId}`);
        try {
          const payload = await api("/api/transfers/respond", {
            method: "POST",
            body: JSON.stringify({
              offerId,
              action,
              counterFee: counterInput ? Number(counterInput.value) : null,
            }),
          });
          ui.state = payload.state;
          showToast(t("responseSent"));
          render();
        } catch (error) {
          showToast(error.message);
        }
      });
    });
  }

  if (ui.tab === "finance") {
    const range = document.getElementById("ticketRange");
    const value = document.getElementById("ticketValue");
    range?.addEventListener("input", () => {
      value.textContent = money(Number(range.value));
    });
    document.getElementById("saveTicketButton")?.addEventListener("click", async () => {
      try {
        const payload = await api("/api/finance/ticket", {
          method: "POST",
          body: JSON.stringify({ ticketPrice: Number(range.value) }),
        });
        ui.state = payload.state;
        showToast(t("ticketSaved"));
        render();
      } catch (error) {
        showToast(error.message);
      }
    });
    document.getElementById("upgradeStadiumButton")?.addEventListener("click", async () => {
      try {
        const payload = await api("/api/finance/stadium", { method: "POST" });
        ui.state = payload.state;
        showToast(t("stadiumUpgraded"));
        render();
      } catch (error) {
        showToast(error.message);
      }
    });
    document.querySelectorAll("[data-camp-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          const payload = await api("/api/finance/camp", {
            method: "POST",
            body: JSON.stringify({ campId: button.dataset.campId }),
          });
          ui.state = payload.state;
          showToast(t("campBooked"));
          render();
        } catch (error) {
          showToast(error.message);
        }
      });
    });
  }

  if (ui.tab === "season") {
    document.getElementById("toggleScorersButton")?.addEventListener("click", () => {
      ui.showAllScorers = !ui.showAllScorers;
      render();
    });
  }

  if (ui.tab === "match") {
    document.getElementById("startMatchButton")?.addEventListener("click", async () => {
      try {
        const payload = await api("/api/match/start", { method: "POST" });
        ui.state = payload.state;
        render();
      } catch (error) {
        showToast(error.message);
      }
    });

    document.getElementById("quickSimButton")?.addEventListener("click", async () => {
      stopLiveTicker();
      try {
        const payload = await api("/api/match/fast-forward", { method: "POST" });
        ui.state = payload.state;
        showToast(t("fastFinished"));
        render();
      } catch (error) {
        showToast(error.message);
      }
    });

    document.querySelectorAll("[data-talk-stage]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          const payload = await api("/api/match/action", {
            method: "POST",
            body: JSON.stringify({
              type: "speech",
              stage: button.dataset.talkStage,
              optionId: button.dataset.talkId,
            }),
          });
          ui.state = payload.state;
          showToast(t("speechDone"));
          render();
          if (ui.state.liveMatch?.status === "live") {
            startLiveTicker();
          }
        } catch (error) {
          showToast(error.message);
        }
      });
    });

    document.querySelectorAll("[data-talk-skip]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          const payload = await api("/api/match/action", {
            method: "POST",
            body: JSON.stringify({ type: "resume", stage: button.dataset.talkSkip }),
          });
          ui.state = payload.state;
          render();
          if (ui.state.liveMatch?.status === "live") {
            startLiveTicker();
          }
        } catch (error) {
          showToast(error.message);
        }
      });
    });

    document.getElementById("applyLiveTacticsButton")?.addEventListener("click", async () => {
      stopLiveTicker();
      try {
        const payload = await api("/api/match/action", {
          method: "POST",
          body: JSON.stringify({
            type: "tactics",
            formation: document.getElementById("liveFormationSelect").value,
            mentality: document.getElementById("liveMentalitySelect").value,
            style: document.getElementById("liveStyleSelect").value,
          }),
        });
        ui.state = payload.state;
        render();
        if (ui.state.liveMatch?.status === "live") {
          startLiveTicker();
        }
      } catch (error) {
        showToast(error.message);
      }
    });

    document.getElementById("makeSubButton")?.addEventListener("click", async () => {
      stopLiveTicker();
      try {
        const payload = await api("/api/match/action", {
          method: "POST",
          body: JSON.stringify({
            type: "substitution",
            playerOutId: Number(document.getElementById("subOutSelect").value),
            playerInId: Number(document.getElementById("subInSelect").value),
          }),
        });
        ui.state = payload.state;
        showToast(t("substitutionDone"));
        render();
        if (ui.state.liveMatch?.status === "live") {
          startLiveTicker();
        }
      } catch (error) {
        showToast(error.message);
      }
    });
  }
}

function renderTabs() {
  const tabKeys = {
    dashboard: "club",
    squad: "squad",
    transfers: "market",
    finance: "finance",
    season: "season",
    match: "match",
  };
  bottomNav.classList.remove("hidden");
  bottomNav.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === ui.tab);
    button.textContent = t(tabKeys[button.dataset.tab] || button.dataset.tab);
  });
}

function renderGame() {
  const views = {
    dashboard: dashboardView,
    squad: squadView,
    transfers: transfersView,
    finance: financeView,
    season: seasonView,
    match: matchView,
  };
  app.innerHTML = `${toolbarView()}${views[ui.tab]()}`;
  renderTabs();
  attachToolbarEvents();
  attachCommonEvents();
  attachTabEvents();
}

function render() {
  if (!ui.state) {
    return;
  }
  if (ui.state.setupRequired) {
    renderSetup();
    attachToolbarEvents();
    attachCommonEvents();
    return;
  }
  renderGame();
}

bottomNav.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tab]");
  if (!button) {
    return;
  }
  ui.tab = button.dataset.tab;
  render();
});

refreshButton.addEventListener("click", loadState);
refreshButton.textContent = t("refresh");

loadState().catch((error) => {
  app.innerHTML = `<section class="loading-card"><p>${error.message}</p></section>`;
});
