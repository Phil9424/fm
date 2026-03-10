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
    creatingCareer: "Стартуем новую карьеру...",
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
    matchEvents: "События матча",
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
    creatingCareer: "Starting a new career...",
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
    matchEvents: "Match events",
  },
};

const OPTION_LABELS = {
  mentality: {
    ultraDefensive: { ru: "Ультра-оборонительный", en: "Ultra-defensive" },
    defensive: { ru: "Оборонительный", en: "Defensive" },
    balanced: { ru: "Сбалансированный", en: "Balanced" },
    positive: { ru: "Позитивный", en: "Positive" },
    attacking: { ru: "Атакующий", en: "Attacking" },
    allOut: { ru: "Ва-банк", en: "All-out" },
  },
  style: {
    possession: { ru: "Владение", en: "Possession" },
    tikiTaka: { ru: "Тики-така", en: "Tiki-taka" },
    direct: { ru: "Прямой", en: "Direct" },
    counter: { ru: "Контратаки", en: "Counter" },
    wingPlay: { ru: "Фланговая игра", en: "Wing play" },
    pressing: { ru: "Прессинг", en: "Pressing" },
    longBall: { ru: "Длинный пас", en: "Long ball" },
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
    accepted: { ru: "Принято", en: "Accepted" },
    negotiating: { ru: "Переговоры", en: "Negotiating" },
    rejected: { ru: "Отклонено", en: "Rejected" },
    withdrawn: { ru: "Отозвано", en: "Withdrawn" },
    completed: { ru: "Завершено", en: "Completed" },
  },
};
const FORMATION_SLOTS = {
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
  showAllEurope: false,
  showAllEuropeDetails: false,
  showAllCups: false,
  selectedLineupSlot: null,
  startingCareer: false,
};

function t(key) {
  const lang = ui.language === "ru" ? "ru" : "en";
  return I18N[lang]?.[key] || I18N.en[key] || key;
}

function looksMojibake(text) {
  if (!text || typeof text !== "string") {
    return false;
  }
  const stripped = text.replace(/[\s0-9.,:;!?()\-\+\/=€$'"`]/g, "");
  if (!stripped) {
    return false;
  }
  const suspicious = (stripped.match(/[РСВÐÑÂÃ]/g) || []).length;
  return suspicious >= 3 && suspicious / stripped.length > 0.35;
}

function cp1251ByteFromCharCode(code) {
  if (code <= 0x7F) return code;
  if (code >= 0x0410 && code <= 0x044F) return code - 0x350;
  const map = {
    0x0401: 0xA8, 0x0451: 0xB8, 0x0404: 0xAA, 0x0454: 0xBA, 0x0407: 0xAF, 0x0457: 0xBF,
    0x0406: 0xB2, 0x0456: 0xB3, 0x040E: 0xA1, 0x045E: 0xA2, 0x2116: 0xB9,
  };
  return map[code] ?? null;
}

function decodeBrokenRu(text) {
  if (!text || typeof text !== "string" || !looksMojibake(text)) {
    return text;
  }
  try {
    let decoded = text;
    for (let pass = 0; pass < 3; pass += 1) {
      const compact = decoded.replace(/[\u00A0\s]+/g, "").replace(/В/g, "");
      const bytes = [];
      for (const ch of compact) {
        const code = ch.charCodeAt(0);
        const b = cp1251ByteFromCharCode(code);
        if (b === null) {
          return decoded;
        }
        bytes.push(b);
      }
      const next = new TextDecoder("utf-8").decode(new Uint8Array(bytes));
      if (!next || next === decoded) {
        break;
      }
      decoded = next;
      if (!looksMojibake(decoded)) {
        break;
      }
    }
    return decoded;
  } catch (_error) {
    return text;
  }
}
function safeText(text, fallback = "") {
  if (!text) {
    return fallback;
  }
  const decoded = decodeBrokenRu(String(text));
  if (looksMojibake(decoded)) {
    return fallback;
  }
  return decoded;
}
function labelFor(group, value) {
  if (ui.language === "ru") {
    const ru = {
      mentality: {
        ultraDefensive: "Ультра-оборонительный",
        defensive: "Оборонительный",
        balanced: "Сбалансированный",
        positive: "Позитивный",
        attacking: "Атакующий",
        allOut: "Ва-банк",
      },
      style: {
        possession: "Владение",
        tikiTaka: "Тики-така",
        direct: "Прямой",
        counter: "Контратаки",
        wingPlay: "Фланговая игра",
        pressing: "Прессинг",
        longBall: "Длинный пас",
      },
      competitionType: {
        league: "Лига",
        cup: "Кубок",
        champions: "Лига чемпионов",
        uefa: "Кубок УЕФА",
      },
      status: {
        pending: "Ожидается",
        played: "Сыгран",
        accepted: "Принято",
        negotiating: "Переговоры",
        rejected: "Отклонено",
        withdrawn: "Отозвано",
        completed: "Завершено",
      },
    };
    return ru[group]?.[value] || OPTION_LABELS[group]?.[value]?.en || value;
  }
  return OPTION_LABELS[group]?.[value]?.en || value;
}

function competitionLabel(match) {
  const name = safeText(match.competitionName || match.competition_name || "");
  const stage = stageLabel(safeText(match.competitionStage || match.competition_stage || ""));
  const type = labelFor("competitionType", match.competitionType || match.competition_type);
  const bits = [name || type, stage].filter(Boolean);
  return bits.join(" - ");
}

function statusLabel(status) {
  return labelFor("status", status);
}

function stageLabel(stage) {
  const normalized = decodeBrokenRu(stage || "");
  if (!normalized || looksMojibake(normalized) || hasMojibake(normalized) || normalized.length > 48) {
    return ui.language === "ru" ? "Групповой этап" : "Group stage";
  }
  const key =
    normalized.includes("Round of 16") || normalized.includes("1/8") ? "Round of 16" :
    normalized.includes("Quarter-final") || normalized.includes("1/4") ? "Quarter-final" :
    normalized.includes("Semi-final") || normalized.includes("1/2") ? "Semi-final" :
    normalized.includes("Final") ? "Final" :
    normalized;

  const labels = {
    "Round of 16": { ru: "1/8 финала", en: "Round of 16" },
    "Quarter-final": { ru: "1/4 финала", en: "Quarter-final" },
    "Semi-final": { ru: "1/2 финала", en: "Semi-final" },
    "Final": { ru: "Финал", en: "Final" },
  };
  return labels[key]?.[ui.language] || safeText(normalized, normalized);
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

function hasMojibake(text = "") {
  const value = String(text);
  return looksMojibake(value) || /[\u0420\u0421][\u0400-\u04FF]/.test(value) || /[\u00D0\u00D1][\u00A0-\u00BF]/.test(value);
}

function cleanUiText(text, fallback = "") {
  if (text == null) {
    return fallback;
  }
  const value = String(text).trim();
  if (!value) {
    return fallback;
  }
  return hasMojibake(value) ? fallback : value;
}

function financeEntryDescription(entry) {
  const fallbackByCategory = ui.language === "ru"
    ? {
      board: "Финансы совета директоров",
      matchday: "Доход в день матча",
      travel: "Логистика и поездки",
      transfer: "Трансферная операция",
      ticketing: "Обновлена цена билета",
      wage: "Выплата зарплат",
      camp: "Тренировочный сбор",
    }
    : {
      board: "Board finances",
      matchday: "Matchday income",
      travel: "Travel and logistics",
      transfer: "Transfer operation",
      ticketing: "Ticket policy updated",
      wage: "Wage payment",
      camp: "Training camp",
    };
  return cleanUiText(entry.description, fallbackByCategory[entry.category] || (ui.language === "ru" ? "Операция клуба" : "Club operation"));
}

function transferOfferMessage(offer) {
  const fallbackByStatus = {
    pending: "Awaiting response.",
    negotiating: "Counter terms received.",
    accepted: "Offer accepted. Confirm to complete.",
    completed: "Transfer completed.",
    rejected: "Offer rejected.",
    withdrawn: "Offer withdrawn.",
  };
  return cleanUiText(offer.message, fallbackByStatus[offer.status] || "");
}
function boardExpectationText(text = "") {
  const value = cleanUiText(text, "");
  if (ui.language !== "ru") {
    return value;
  }
  const lower = value.toLowerCase();
  if (lower.includes("promotion") || lower.includes("europe")) return "Борьба за повышение или еврокубки";
  if (lower.includes("mid-table") || lower.includes("mid table")) return "Надежное место в середине таблицы";
  if (lower.includes("title")) return "Борьба за чемпионство";
  return value || "Стабильные результаты";
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
  const managerLang = ui.state?.manager?.language;
  const storedLang = localStorage.getItem("lfm-lang");
  ui.language = managerLang === "ru" || storedLang === "ru" ? "ru" : "en";
  localStorage.setItem("lfm-lang", ui.language);
  refreshButton.textContent = t("refresh");
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const rawText = await response.text();
  let payload = null;
  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch (_error) {
    const fallbackMessage = rawText?.slice(0, 220) || "Server returned non-JSON response";
    throw new Error(ui.language === "ru" ? `Ошибка сервера: ${fallbackMessage}` : `Server error: ${fallbackMessage}`);
  }
  if (!payload || typeof payload !== "object") {
    throw new Error(ui.language === "ru" ? "Некорректный ответ сервера" : "Invalid server response");
  }
  if (!payload.ok) {
    throw new Error(payload.error || (ui.language === "ru" ? "Ошибка запроса" : "Request failed"));
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
  ui.language = language === "ru" ? "ru" : "en";
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
          <strong>${ui.state?.club?.name || (ui.language === "ru" ? "Футбольный менеджер" : "Legacy Football Manager")}</strong>
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
      ${ui.startingCareer ? `<div class="inline-status-banner">${t("creatingCareer")}</div>` : ""}
      <h2 class="section-title">${t("chooseLeague")}</h2>
      <div class="league-grid">
        ${leagueKeys.map((leagueKey) => {
          const [country, name] = leagueKey.split("__");
          return `
            <button class="league-card ${ui.selectedLeague === leagueKey ? "active" : ""}" data-league-key="${leagueKey}" ${ui.startingCareer ? "disabled" : ""}>
              <strong>${country}</strong>
              <span>${name}</span>
            </button>
          `;
        }).join("")}
      </div>
      <h2 class="section-title" style="margin-top:14px">${t("chooseClub")}</h2>
      <div class="club-card-grid">
        ${teams.map((club) => `
          <button class="club-selection-card ${ui.selectedClubId === club.id ? "active" : ""}" data-club-id="${club.id}" ${ui.startingCareer ? "disabled" : ""}>
            <div class="cluster">
              ${badge(club.name, club.logoPrimary, club.logoSecondary)}
              <div>
                <strong>${club.name}</strong>
                <div class="secondary">${leagueName}</div>
                <div class="soft-pill">${boardExpectationText(club.boardExpectation)}</div>
              </div>
            </div>
          </button>
        `).join("")}
      </div>
      <div class="field" style="margin-top:16px">
        <label>${t("managerName")}</label>
        <input id="managerName" value="Legacy Manager" ${ui.startingCareer ? "disabled" : ""} />
      </div>
      <div class="action-row">
        <button id="startCareerButton" class="primary-button" ${ui.startingCareer ? "disabled" : ""}>${ui.startingCareer ? t("creatingCareer") : t("startCareer")}</button>
      </div>
      ${(ui.state.saveSlots || []).length ? `
        <section class="card compact-card">
          <p class="eyebrow">${t("load")}</p>
          <div class="grid">
            ${ui.state.saveSlots.map((slot) => `
              <div class="split">
                <span>${slot.name}</span>
                <button class="mini-button" data-load-slot="${slot.id}" ${ui.startingCareer ? "disabled" : ""}>${t("load")}</button>
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
  const leagueOnlySummary = (roundSummary || []).filter((match) => !match.competitionName || match.competitionName === club.leagueName);
  const boardFallback = manager.jobStatus !== "active"
    ? (ui.language === "ru"
        ? "Совет директоров уволил тебя. Начни новую карьеру или загрузи более раннее сохранение."
        : "The board has dismissed you. Start a new career or load an earlier save.")
    : (ui.language === "ru"
        ? "Совет директоров ожидает стабильные результаты."
        : "The board expects stable results.");
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
      <p>${safeText(board.message, boardFallback)}</p>
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
        ${leagueOnlySummary.length ? leagueOnlySummary.map((match) => `
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
  const formationSlots = FORMATION_SLOTS[ui.state.tactics.formation] || FORMATION_SLOTS["4-4-2"];
  const lineupSections = [
    { code: "G", label: ui.language === "ru" ? "Вратарь" : "Goalkeeper" },
    { code: "D", label: ui.language === "ru" ? "Защита" : "Defenders" },
    { code: "M", label: ui.language === "ru" ? "Полузащита" : "Midfielders" },
    { code: "F", label: ui.language === "ru" ? "Нападение" : "Forwards" },
  ];

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
      <div class="split">
        <span class="secondary">${ui.language === "ru" ? "Нажми на слот, затем выбери игрока ниже." : "Tap a slot, then choose a player below."}</span>
        <strong>${ui.language === "ru" ? "Автосохранение включено" : "Auto-save is on"}</strong>
      </div>
      <div class="squad-layout">
        <div class="card compact-card">
          <p class="eyebrow">${t("yourTeam")}</p>
          <div class="grouped-slots">
            ${lineupSections.map((section) => {
              const indexes = formationSlots
                .map((slot, index) => ({ slot, index }))
                .filter((entry) => entry.slot === section.code)
                .map((entry) => entry.index);

              if (!indexes.length) {
                return "";
              }

              return `
                <div class="lineup-unit">
                  <div class="lineup-unit-title">${section.label} (${indexes.length})</div>
                  <div class="lineup-unit-grid">
                    ${indexes.map((index) => {
                      const player = playerById(ui.lineupDraft[index]);
                      const selected = ui.selectedLineupSlot === index ? "slot-selected" : "";
                      const slotCode = formationSlots[index];
                      return `
                        <div class="squad-slot ${selected}" data-slot-index="${index}">
                          <div>
                            <strong>${ui.language === "ru" ? `Слот ${index + 1}` : `Slot ${index + 1}`}</strong>
                            <div class="secondary">${slotCode}</div>
                          </div>
                          ${player
                            ? `<div><strong>${player.name}</strong><div class="secondary">${player.position} - ${player.overall}</div></div>`
                            : `<div class="drag-placeholder">${ui.language === "ru" ? "Пусто" : "Empty"}</div>`}
                          <div class="action-row">
                            <button type="button" class="mini-button" data-slot-pick="${index}">${ui.language === "ru" ? "Выбрать" : "Pick"}</button>
                            ${player ? `<button type="button" class="mini-button" data-to-pool="${player.id}">${ui.language === "ru" ? "Снять" : "Out"}</button>` : ""}
                          </div>
                        </div>
                      `;
                    }).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
        <div class="card compact-card">
          <p class="eyebrow">${t("benchAndReserves")}</p>
          <div class="drag-pool">
            ${poolPlayers.map((player) => `
              <div class="drag-player">
                <div><strong>${player.name}</strong><span>${player.position} - ${player.overall}</span></div>
                <div class="action-row">
                  <button type="button" class="mini-button" data-to-lineup="${player.id}">${ui.language === "ru" ? "В состав" : "To lineup"}</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
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
            <div class="secondary">${transferOfferMessage(offer)}</div>
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
  const campName = (camp) => {
    if (ui.language !== "ru") {
      return camp.name;
    }
    const names = { madrid: "Сбор в Мадриде", lisbon: "Сбор в Лиссабоне", dubai: "Сбор в Дубае" };
    return names[camp.id] || safeText(camp.name, "Тренировочный сбор");
  };
  const campEffect = (camp) => safeText(camp.effect, ui.language === "ru" ? "Мораль, форма и навыки всей команды растут." : "Morale, fitness and squad attributes improve.");
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
              <strong>${campName(camp)}</strong>
              <div class="secondary">${campEffect(camp)}</div>
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
              <strong>${financeEntryDescription(entry)}</strong>
              <div class="secondary">${t("round")} ${entry.roundNo}</div>
            </div>
            <strong style="color:${entry.amount >= 0 ? "var(--ok)" : "var(--danger)"}">${money(entry.amount)}</strong>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function isManagerFixture(match, managerClubId) {
  return match.homeClubId === managerClubId || match.awayClubId === managerClubId;
}

function buildPostRoundSummary(roundSummary, club, matchContext) {
  const rows = Array.isArray(roundSummary) ? roundSummary : [];
  const competitionType = matchContext?.competitionType || "league";
  const competitionName = matchContext?.competitionName || "";

  if (competitionType === "league") {
    return rows.filter((match) => {
      const matchType = match.competitionType || "league";
      const matchName = match.competitionName || "";
      return matchType === "league" && (!matchName || matchName === club.leagueName);
    });
  }

  return rows.filter((match) => {
    const matchType = match.competitionType || "";
    const matchName = match.competitionName || "";
    return matchType === competitionType && (!competitionName || matchName === competitionName);
  });
}
function competitionCards(cards, managerClubId, ownOnly = false, hideNonManagerDetails = false) {
  return cards.length ? cards.map((card) => {
    const cardTypeLabel = labelFor("competitionType", card.type || "cup");
    const cardName = safeText(card.name, cardTypeLabel);
    const cardStage = stageLabel(safeText(card.currentStage, "")) || "-";
    const restrictToMine = (ownOnly || hideNonManagerDetails) && card.involvesManager;
    const upcomingList = restrictToMine
      ? (card.nextFixtures.filter((match) => isManagerFixture(match, managerClubId)).length
          ? card.nextFixtures.filter((match) => isManagerFixture(match, managerClubId))
          : card.nextFixtures)
      : card.nextFixtures;

    const recentList = restrictToMine
      ? (card.recentResults.filter((match) => isManagerFixture(match, managerClubId)).length
          ? card.recentResults.filter((match) => isManagerFixture(match, managerClubId))
          : card.recentResults)
      : card.recentResults;

    const allGroupTables = card.groupTables || [];
    const visibleGroupTables = hideNonManagerDetails && card.involvesManager
      ? (allGroupTables.filter((groupTable) => groupTable.rows.some((row) => row.clubId === managerClubId)).length
          ? allGroupTables.filter((groupTable) => groupTable.rows.some((row) => row.clubId === managerClubId))
          : allGroupTables)
      : allGroupTables;

    return `
    <div class="offer-card">
      <div class="split">
        <strong>${cardName}</strong>
        <span class="soft-pill">${cardStage}</span>
      </div>
      <div class="secondary">${t("upcomingMatches")}</div>
      <div class="grid">
        ${upcomingList.length ? upcomingList.slice(0, 4).map((match) => `
          <div class="split">
            <span>${safeText(match.homeClubName, "-")} - ${safeText(match.awayClubName, "-")}${isManagerFixture(match, managerClubId) ? (ui.language === "ru" ? " (ты)" : " (you)") : ""}</span>
            <strong>${formatDate(match.matchDate)}</strong>
          </div>
        `).join("") : `<div class="secondary">${t("noData")}</div>`}
      </div>
      <div class="secondary">${t("recentResultsTitle")}</div>
      <div class="grid">
        ${recentList.length ? recentList.slice(0, 4).map((match) => `
          <div class="split">
            <span>${safeText(match.homeClubName, "-")} - ${safeText(match.awayClubName, "-")}</span>
            <strong>${match.homeScore}-${match.awayScore}${match.resultNote ? ` | ${safeText(match.resultNote, "")}` : ""}</strong>
          </div>
        `).join("") : `<div class="secondary">${t("noData")}</div>`}
      </div>
      ${visibleGroupTables?.length ? `
        <div class="secondary">${ui.language === "ru" ? "Таблицы групп" : "Group tables"}</div>
        <div class="table-wrap">
          ${visibleGroupTables.map((groupTable) => `
            <table class="competition-fixture-table">
              <thead><tr><th colspan="6">${ui.language === "ru" ? "Группа" : "Group"} ${groupTable.group}</th></tr></thead>
              <tbody>
                ${groupTable.rows.map((row) => `
                  <tr>
                    <td>${safeText(row?.clubName, "-")}${row?.clubId === managerClubId ? " *" : ""}</td>
                    <td>${row?.played ?? 0}</td>
                    <td>${row?.goalDifference ?? 0}</td>
                    <td>${row?.points ?? 0}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
  }).join("") : `<p class="secondary">${t("noData")}</p>`;
}

function seasonView() {
  const scorers = ui.showAllScorers ? ui.state.topScorers : ui.state.topScorers.slice(0, 5);
  const europeCards = ui.state.competitionOverview?.europe || [];
  const managerEuropeCards = europeCards.filter((card) => card.involvesManager);
  const visibleEuropeCards = ui.showAllEurope || !managerEuropeCards.length ? europeCards : managerEuropeCards;
  const cupCards = ui.state.competitionOverview?.domesticCups || [];
  const managerCupCards = cupCards.filter((card) => card.sameCountry);
  const visibleCupCards = ui.showAllCups || !managerCupCards.length ? cupCards : managerCupCards;
  return `
    <section class="card">
      <p class="eyebrow">${t("leagueTable")}</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Club</th><th>P</th><th>GD</th><th>Pts</th></tr></thead>
          <tbody>
            ${ui.state.leagueTable.map((row) => `
              <tr>
                <td>${row.rank}</td>
                <td>${row.clubName}</td>
                <td>${row?.played ?? 0}</td>
                <td>${row?.goalDifference ?? 0}</td>
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
      <div class="split">
        <p class="eyebrow">${t("eurocups")}</p>
        ${managerEuropeCards.length && !ui.showAllEurope ? `<button class="mini-button" data-toggle-europe="all">${t("showAll")}</button>` : ""}
        ${ui.showAllEurope ? `<button class="mini-button" data-toggle-europe="mine">${ui.language === "ru" ? "Мои турниры" : "My competitions"}</button>` : ""}
      </div>
      ${managerEuropeCards.length ? `
        <div class="action-row">
          <button class="ghost-button" data-toggle-europe-details="${ui.showAllEuropeDetails ? "mine" : "all"}">
            ${ui.showAllEuropeDetails
              ? (ui.language === "ru" ? "Только моя группа и мои матчи" : "Only my group and my matches")
              : (ui.language === "ru" ? "Показать все группы и матчи" : "Show all groups and matches")}
          </button>
        </div>
      ` : ""}
      <div class="grid">
        ${competitionCards(visibleEuropeCards, ui.state.club.id, !ui.showAllEurope, !ui.showAllEuropeDetails)}
      </div>
    </section>

    <section class="card">
      <div class="split">
        <p class="eyebrow">${t("domesticCups")}</p>
        ${managerCupCards.length && !ui.showAllCups ? `<button class="mini-button" data-toggle-cups="all">${t("showAll")}</button>` : ""}
        ${ui.showAllCups ? `<button class="mini-button" data-toggle-cups="mine">${ui.language === "ru" ? "Моя страна" : "Home country"}</button>` : ""}
      </div>
      <div class="grid">
        ${competitionCards(visibleCupCards, ui.state.club.id, !ui.showAllCups)}
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
            <span class="soft-pill">${match.status === "played" ? `${match.homeScore}-${match.awayScore}${match.resultNote ? ` | ${safeText(match.resultNote, "")}` : ""}` : `${t("round")} ${match.roundNo}`}</span>
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

function renderMatchEventFeed(liveMatch) {
  const list = (liveMatch?.events || []).filter((event) => ["goal", "yellow", "red", "injury"].includes(event.type));
  if (!list.length) {
    return `<p class="secondary">${t("noData")}</p>`;
  }

  return `
    <div class="match-events-timeline">
      ${list.map((event) => {
        let badge = "•";
        let headline = safeText(event.playerName, "-");
        let detail = "";
        let className = "match-event";

        if (event.type === "goal") {
          badge = "⚽";
          headline = ui.language === "ru" ? "ГОООООООЛ" : "GOOOAAAL";
          detail = `${safeText(event.playerName, "-")}${event.assistName ? ` • ${ui.language === "ru" ? "пас" : "assist"}: ${event.assistName}` : ""}`;
          className += " goal";
        } else if (event.type === "yellow") {
          badge = "🟨";
          headline = event.dismissal
            ? (ui.language === "ru" ? "Вторая желтая" : "Second yellow")
            : (ui.language === "ru" ? "Желтая карточка" : "Yellow card");
          detail = safeText(event.playerName, "-");
          className += " yellow";
        } else if (event.type === "red") {
          badge = "🟥";
          headline = event.reason === "secondYellow"
            ? (ui.language === "ru" ? "Удаление после второй желтой" : "Sent off after second yellow")
            : (ui.language === "ru" ? "Прямая красная" : "Straight red");
          detail = safeText(event.playerName, "-");
          className += " red";
        } else if (event.type === "injury") {
          badge = "🤕";
          headline = ui.language === "ru" ? "Травма" : "Injury";
          detail = `${safeText(event.playerName, "-")}${event.injuryGames ? ` • ${ui.language === "ru" ? `пропустит ${event.injuryGames} матч.` : `out for ${event.injuryGames} match(es)`}` : ""}`;
          className += " injury";
        }

        const homeContent = event.side === "home"
          ? `<div class="${className} left"><div class="match-event-badge">${badge}</div><div class="match-event-body"><strong>${headline}</strong><div>${detail}</div></div></div>`
          : `<div></div>`;
        const awayContent = event.side === "away"
          ? `<div class="${className} right"><div class="match-event-body"><strong>${headline}</strong><div>${detail}</div></div><div class="match-event-badge">${badge}</div></div>`
          : `<div></div>`;

        return `
          <div class="match-event-row">
            ${homeContent}
            <div class="match-event-center">
              <span class="match-event-minute">${event.minute}'</span>
            </div>
            ${awayContent}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function matchView() {
  const { liveMatch, nextFixture } = ui.state;
  if (!liveMatch) {
    if (ui.postRoundSummary) {
      return `
        <section class="card">
          <p class="eyebrow">${ui.language === "ru" ? "Итоги тура" : "Round recap"}</p>
          <h2 class="section-title">${ui.language === "ru" ? "Сыгранные матчи" : "Played matches"}</h2>
          <div class="grid">
            ${ui.postRoundSummary.length ? ui.postRoundSummary.map((match) => `
              <div class="split">
                <span>${safeText(match.homeClubName, "-")} - ${safeText(match.awayClubName, "-")}</span>
                <strong>${match.homeScore}-${match.awayScore}</strong>
              </div>
            `).join("") : `<p class="secondary">${t("noData")}</p>`}
          </div>
          <div class="action-row">
            <button id="closePostRoundButton" class="primary-button">${ui.language === "ru" ? "Далее" : "Continue"}</button>
          </div>
        </section>
      `;
    }
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
  const availableSubOut = yourTeam.starters.filter((player) => !player.sentOff);

  if (liveMatch.status === "pregame") {
    return `
      <section class="card">
        <p class="eyebrow">${t("preMatchTalk")}</p>
        <h2 class="section-title">${liveMatch.home.clubName} - ${liveMatch.away.clubName}</h2>
        <div class="grid two">
          <div class="card compact-card">
            <div class="split"><span>${t("date")}</span><strong>${formatDate(liveMatch.matchContext.matchDate)}</strong></div>
            <div class="split"><span>${t("competition")}</span><strong>${competitionLabel(liveMatch.matchContext)}</strong></div>
            <div class="split"><span>${t("weather")}</span><strong>${ui.language === "ru" ? liveMatch.matchContext.weather.ru : liveMatch.matchContext.weather.en}, ${liveMatch.matchContext.weather.temperature}°C</strong></div>
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
          <button id="advanceMatchButton" class="ghost-button">${t("continueMatch")}</button>
        <button id="quickSimButton" class="ghost-button">${t("quickSim")}</button>
        </div>
        ${renderTalkOptions("pregame", liveMatch.preMatchSpeechOptions)}
      </section>
    `;
  }

  if (liveMatch.status === "finished") {
    return     `
      <section class="card">
        <p class="eyebrow">${ui.language === "ru" ? "Матч завершен" : "Match finished"}</p>
        <div class="match-score">
          <div><small>${liveMatch.home.clubName}</small><div>${liveMatch.score.home}</div></div>
          <div>FT</div>
          <div style="text-align:right"><small>${liveMatch.away.clubName}</small><div>${liveMatch.score.away}</div></div>
        </div>
        <div class="grid three">
          <article class="stat-box"><span class="secondary">${t("possession")}</span><strong>${liveMatch.stats.home.possession}% - ${liveMatch.stats.away.possession}%</strong></article>
          <article class="stat-box"><span class="secondary">${t("shots")}</span><strong>${liveMatch.stats.home.shots} - ${liveMatch.stats.away.shots}</strong></article>
          <article class="stat-box"><span class="secondary">${t("onTarget")}</span><strong>${liveMatch.stats.home.shotsOnTarget} - ${liveMatch.stats.away.shotsOnTarget}</strong></article>
        </div>
      </section>

      <section class="card">
        <p class="eyebrow">${t("matchEvents")}</p>
        <div class="grid">
          ${renderMatchEventFeed(liveMatch)}
        </div>
        <div class="action-row">
          <button id="continueAfterMatchButton" class="primary-button">${ui.language === "ru" ? "Далее" : "Continue"}</button>
        </div>
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
      <div class="card compact-card">
        <p class="eyebrow">${t("matchEvents")}</p>
        <div class="grid">
          ${renderMatchEventFeed(liveMatch)}
        </div>
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
          <select id="subOutSelect">${availableSubOut.map((player) => `<option value="${player.id}">${player.name}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>${t("playerIn")}</label>
          <select id="subInSelect">${yourTeam.bench.map((player) => `<option value="${player.id}">${player.name}</option>`).join("")}</select>
        </div>
      </div>
      <div class="action-row">
        <button id="makeSubButton" class="primary-button" ${!availableSubOut.length || !yourTeam.bench.length ? "disabled" : ""}>${t("makeSubstitution")}</button>
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
    if (ui.startingCareer) {
      return;
    }
    const managerName = document.getElementById("managerName").value || "Legacy Manager";
    ui.startingCareer = true;
    render();
    try {
      const payload = await api("/api/new-game", {
        method: "POST",
        body: JSON.stringify({
          clubId: ui.selectedClubId,
          managerName,
          language: ui.language,
        }),
      });
      ui.startingCareer = false;
      ui.state = payload.state;
      syncLanguageFromState();
      ui.tab = "dashboard";
      showToast(t("created"));
      render();
    } catch (error) {
      ui.startingCareer = false;
      render();
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
  if (displaced && displaced !== playerId && !ui.poolDraft.includes(displaced)) {
    ui.poolDraft.push(displaced);
  }
  persistSquadDraft();
}

function moveToPool(playerId) {
  ui.lineupDraft = ui.lineupDraft.filter((id) => id !== playerId);
  if (!ui.poolDraft.includes(playerId)) {
    ui.poolDraft.push(playerId);
  }
  while (ui.lineupDraft.length < 11 && ui.poolDraft.length) {
    ui.lineupDraft.push(ui.poolDraft.shift());
  }
  persistSquadDraft();
}

function swapLineupSlots(firstIndex, secondIndex) {
  if (!Number.isInteger(firstIndex) || !Number.isInteger(secondIndex) || firstIndex === secondIndex) {
    return;
  }
  const first = ui.lineupDraft[firstIndex];
  const second = ui.lineupDraft[secondIndex];
  ui.lineupDraft[firstIndex] = second;
  ui.lineupDraft[secondIndex] = first;
  persistSquadDraft();
}
let squadSaveTimer = null;

function persistSquadDraft(immediate = false) {
  const run = async () => {
    try {
      const payload = await api("/api/tactics", {
        method: "POST",
        body: JSON.stringify({
          formation: document.getElementById("formationSelect")?.value || ui.state.tactics.formation,
          mentality: document.getElementById("mentalitySelect")?.value || ui.state.tactics.mentality,
          style: document.getElementById("styleSelect")?.value || ui.state.tactics.style,
          starters: ui.lineupDraft,
          bench: ui.poolDraft.slice(0, 7),
        }),
      });
      ui.state = payload.state;
      render();
    } catch (error) {
      showToast(error.message);
    }
  };

  clearTimeout(squadSaveTimer);
  if (immediate) {
    run();
    return;
  }
  squadSaveTimer = setTimeout(run, 220);
}

function bestSlotForPlayer(playerId, forceSelected = false) {
  if (forceSelected && Number.isInteger(ui.selectedLineupSlot)) {
    return ui.selectedLineupSlot;
  }
  const player = playerById(playerId);
  if (!player) return 0;
  const formation = document.getElementById("formationSelect")?.value || ui.state.tactics.formation;
  const slots = FORMATION_SLOTS[formation] || FORMATION_SLOTS["4-4-2"];

  const matching = slots
    .map((slot, index) => ({ slot, index, occupant: playerById(ui.lineupDraft[index]) }))
    .filter((entry) => entry.slot === player.position);

  const emptyMatch = matching.find((entry) => !entry.occupant);
  if (emptyMatch) return emptyMatch.index;

  const weakestMatch = matching
    .filter((entry) => entry.occupant)
    .sort((a, b) => (a.occupant.overall || 0) - (b.occupant.overall || 0))[0];
  if (weakestMatch) return weakestMatch.index;

  const weakestAny = ui.lineupDraft
    .map((id, index) => ({ index, occupant: playerById(id) }))
    .filter((entry) => entry.occupant)
    .sort((a, b) => (a.occupant.overall || 0) - (b.occupant.overall || 0))[0];

  return weakestAny ? weakestAny.index : 0;
}

function attachSquadSelectionEvents() {
  document.querySelectorAll("[data-slot-index]").forEach((slot) => {
    slot.addEventListener("click", () => {
      const clicked = Number(slot.dataset.slotIndex);
      if (!Number.isInteger(clicked)) {
        return;
      }
      if (Number.isInteger(ui.selectedLineupSlot) && ui.selectedLineupSlot !== clicked) {
        swapLineupSlots(ui.selectedLineupSlot, clicked);
        ui.selectedLineupSlot = null;
      } else if (ui.selectedLineupSlot === clicked) {
        ui.selectedLineupSlot = null;
      } else {
        ui.selectedLineupSlot = clicked;
      }
      render();
    });
  });
  document.querySelectorAll("[data-slot-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      ui.selectedLineupSlot = Number(button.dataset.slotPick);
      render();
    });
  });

  document.querySelectorAll("[data-to-pool]").forEach((button) => {
    button.addEventListener("click", () => {
      moveToPool(Number(button.dataset.toPool));
      render();
    });
  });

  document.querySelectorAll("[data-to-lineup]").forEach((button) => {
    button.addEventListener("click", () => {
      const playerId = Number(button.dataset.toLineup);
      const slot = bestSlotForPlayer(playerId, true);
      moveToLineup(playerId, slot);
      ui.selectedLineupSlot = null;
      render();
    });
  });
}
function stopLiveTicker() {
  clearInterval(ui.liveTicker);
  ui.liveTicker = null;
}

function startLiveTicker() {
  if (ui.liveTicker) {
    return;
  }
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
    attachSquadSelectionEvents();
    ["formationSelect", "mentalitySelect", "styleSelect"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", () => persistSquadDraft(true));
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
    document.querySelector("[data-toggle-europe='all']")?.addEventListener("click", () => {
      ui.showAllEurope = true;
      render();
    });
    document.querySelector("[data-toggle-europe='mine']")?.addEventListener("click", () => {
      ui.showAllEurope = false;
      render();
    });
    document.querySelector("[data-toggle-europe-details='all']")?.addEventListener("click", () => {
      ui.showAllEuropeDetails = true;
      render();
    });
    document.querySelector("[data-toggle-europe-details='mine']")?.addEventListener("click", () => {
      ui.showAllEuropeDetails = false;
      render();
    });
    document.querySelector("[data-toggle-cups='all']")?.addEventListener("click", () => {
      ui.showAllCups = true;
      render();
    });
    document.querySelector("[data-toggle-cups='mine']")?.addEventListener("click", () => {
      ui.showAllCups = false;
      render();
    });
  }
  if (ui.tab === "match") {
    ["liveFormationSelect", "liveMentalitySelect", "liveStyleSelect", "subOutSelect", "subInSelect"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) {
        return;
      }
      el.addEventListener("focus", () => stopLiveTicker());
      el.addEventListener("click", () => stopLiveTicker());
      el.addEventListener("change", () => stopLiveTicker());
    });
    document.getElementById("startMatchButton")?.addEventListener("click", async () => {
      try {
        const payload = await api("/api/match/start", { method: "POST" });
        ui.state = payload.state;
        ui.postRoundSummary = null;
        render();
      } catch (error) {
        showToast(error.message);
      }
    });

    document.getElementById("advanceMatchButton")?.addEventListener("click", async () => {
      try {
        if (ui.state.liveMatch?.status === "live") {
          const payload = await api("/api/match/advance", { method: "POST" });
          ui.state = payload.state;
        } else {
          const payload = await api("/api/match/action", {
            method: "POST",
            body: JSON.stringify({ type: "resume", stage: ui.state.liveMatch?.status || "pregame" }),
          });
          ui.state = payload.state;
        }
        render();
      } catch (error) {
        showToast(error.message);
      }
    });

    document.getElementById("continueAfterMatchButton")?.addEventListener("click", async () => {
      try {
        const finished = ui.state.liveMatch;
        const finishedMatchContext = finished?.matchContext || null;
        const finishedFallback = finished
          ? [{
            homeClubName: finished.home?.clubName || "-",
            awayClubName: finished.away?.clubName || "-",
            homeScore: finished.score?.home ?? 0,
            awayScore: finished.score?.away ?? 0,
          }]
          : [];
        const payload = await api("/api/match/continue", { method: "POST" });
        ui.state = payload.state;
        ui.postRoundSummary = buildPostRoundSummary(payload.state.roundSummary || [], ui.state.club, finishedMatchContext);
        if (!ui.postRoundSummary.length && finishedFallback.length) {
          ui.postRoundSummary = finishedFallback;
        }
        render();
      } catch (error) {
        showToast(error.message);
      }
    });

    document.getElementById("closePostRoundButton")?.addEventListener("click", () => {
      ui.postRoundSummary = null;
      ui.tab = "dashboard";
      render();
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

function syncLiveTickerState() {
  if (ui.tab === "match" && ui.state?.liveMatch?.status === "live") {
    startLiveTicker();
    return;
  }
  stopLiveTicker();
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
  syncLiveTickerState();
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













































































