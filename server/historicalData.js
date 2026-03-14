const fs = require("fs");
const os = require("os");
const path = require("path");
const cheerio = require("cheerio");

const CACHE_DIR = process.env.HISTORICAL_CACHE_DIR
  ? path.resolve(process.env.HISTORICAL_CACHE_DIR)
  : (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
    ? path.join(os.tmpdir(), "fm-historical-cache")
    : path.join(__dirname, "..", ".cache", "historical");
const FIFA_INDEX_DATA_FILE = path.join(__dirname, "data", "fifa08-ratings.json");
const SEASON_LABEL = "2007-08";
let cachedFifaIndexLookup = null;

const COMPETITIONS = [
  {
    country: "England",
    name: "Premier League",
    tier: 1,
    url: "https://www.statscrew.com/worldfootball/l-ENGPRE/y-2007",
  },
  {
    country: "England",
    name: "Championship",
    tier: 2,
    url: "https://www.statscrew.com/worldfootball/l-ENGCHA/y-2007",
  },
  {
    country: "France",
    name: "Ligue 1",
    tier: 1,
    url: "https://www.statscrew.com/worldfootball/l-FRALG1/y-2007",
  },
  {
    country: "France",
    name: "Ligue 2",
    tier: 2,
    url: "https://www.statscrew.com/worldfootball/l-FRALG2/y-2007",
  },
  {
    country: "Portugal",
    name: "Primeira Liga",
    tier: 1,
    url: "https://www.statscrew.com/worldfootball/l-PORPRI/y-2007",
  },
  {
    country: "Portugal",
    name: "Segunda Liga",
    tier: 2,
    url: "https://www.statscrew.com/worldfootball/l-PORSEG/y-2007",
  },
  {
    country: "Italy",
    name: "Serie A",
    tier: 1,
    url: "https://www.statscrew.com/worldfootball/l-ITASEA/y-2007",
  },
  {
    country: "Italy",
    name: "Serie B",
    tier: 2,
    url: "https://www.statscrew.com/worldfootball/l-ITASEB/y-2007",
  },
  {
    country: "Spain",
    name: "La Liga",
    tier: 1,
    url: "https://www.statscrew.com/worldfootball/l-SPAPRI/y-2007",
  },
  {
    country: "Spain",
    name: "Segunda Division",
    tier: 2,
    url: "https://www.statscrew.com/worldfootball/l-SPASEG/y-2007",
  },
  {
    country: "Germany",
    name: "Bundesliga",
    tier: 1,
    url: "https://www.statscrew.com/worldfootball/l-GERBUN/y-2007",
  },
  {
    country: "Germany",
    name: "2. Bundesliga",
    tier: 2,
    url: "https://www.statscrew.com/worldfootball/l-GER2BL/y-2007",
  },
  {
    country: "Russia",
    name: "Premier Liga",
    tier: 1,
    url: "https://www.statscrew.com/worldfootball/l-RUSPRE/y-2007",
  },
  {
    country: "Russia",
    name: "First Division",
    tier: 2,
    url: "https://www.statscrew.com/worldfootball/l-RUS1DI/y-2007",
  },
];

const NAME_POOLS = {
  England: {
    first: ["Jack", "Tom", "Daniel", "Ben", "James", "Harry", "Liam", "Scott", "Ryan", "Michael"],
    last: ["Davies", "Thompson", "Clarke", "Carter", "Murphy", "Bennett", "Fisher", "Turner", "Parker", "Wright"],
  },
  France: {
    first: ["Alexis", "Luc", "Julien", "Maxime", "Nicolas", "Romain", "Adrien", "Thomas", "Hugo", "Mathieu"],
    last: ["Moreau", "Lambert", "Girard", "Bernard", "Leroy", "Roux", "Fontaine", "Chevalier", "Perrin", "Dupont"],
  },
  Portugal: {
    first: ["Joao", "Tiago", "Ruben", "Bruno", "Miguel", "Andre", "Diogo", "Luis", "Pedro", "Ricardo"],
    last: ["Silva", "Costa", "Pereira", "Sousa", "Ferreira", "Oliveira", "Almeida", "Martins", "Carvalho", "Gomes"],
  },
  Italy: {
    first: ["Marco", "Luca", "Andrea", "Fabio", "Paolo", "Nicolo", "Davide", "Matteo", "Simone", "Stefano"],
    last: ["Rossi", "Esposito", "Ferrari", "Galli", "Romano", "Costa", "Barbieri", "Moretti", "Marino", "Conti"],
  },
  Spain: {
    first: ["David", "Sergio", "Juan", "Pedro", "Miguel", "Carlos", "Alvaro", "Ruben", "Javier", "Pablo"],
    last: ["Garcia", "Lopez", "Fernandez", "Martinez", "Ruiz", "Sanchez", "Navarro", "Torres", "Moreno", "Castro"],
  },
  Germany: {
    first: ["Lukas", "Jonas", "Felix", "Jan", "Tobias", "Kevin", "Leon", "Marco", "Dennis", "Nico"],
    last: ["Muller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Hoffmann", "Keller"],
  },
  Russia: {
    first: ["Ivan", "Dmitri", "Sergei", "Alexei", "Andrei", "Maksim", "Nikita", "Roman", "Kirill", "Vladimir"],
    last: ["Ivanov", "Smirnov", "Sokolov", "Kuznetsov", "Popov", "Lebedev", "Morozov", "Volkov", "Pavlov", "Fedorov"],
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeName(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();
}

function broadPosition(value) {
  const token = String(value || "").toUpperCase();
  if (!token) {
    return "M";
  }
  if (token.includes("GK")) {
    return "G";
  }
  if (["CB", "LB", "RB", "LWB", "RWB", "SWB", "SW"].some((item) => token.includes(item))) {
    return "D";
  }
  if (["ST", "CF", "LF", "RF", "LS", "RS", "LW", "RW", "LWF", "RWF"].some((item) => token.includes(item))) {
    return "F";
  }
  return "M";
}

function cleanFifaIndexTeamName(value) {
  return String(value || "")
    .replace(/\s+FIFA\s*08$/i, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clubTokens(value) {
  const stopWords = new Set(["fc", "cf", "ac", "as", "sc", "fk", "club", "football", "calcio", "cd", "ud"]);
  return cleanFifaIndexTeamName(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token && !stopWords.has(token));
}

function clubsRoughlyMatch(a, b) {
  const exactA = normalizeName(cleanFifaIndexTeamName(a));
  const exactB = normalizeName(cleanFifaIndexTeamName(b));
  if (exactA && exactA === exactB) {
    return true;
  }

  const tokensA = clubTokens(a);
  const tokensB = clubTokens(b);
  if (!tokensA.length || !tokensB.length) {
    return false;
  }

  const shared = tokensA.filter((token) => tokensB.includes(token)).length;
  return shared >= Math.min(tokensA.length, tokensB.length) || shared >= 2;
}

function personTokens(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function tokenLooselyMatches(a, b) {
  if (!a || !b) {
    return false;
  }
  return a === b || a.includes(b) || b.includes(a);
}

function namesRoughlyMatch(a, b) {
  const normalizedA = normalizeName(a);
  const normalizedB = normalizeName(b);
  if (normalizedA && normalizedA === normalizedB) {
    return true;
  }

  const tokensA = personTokens(a);
  const tokensB = personTokens(b);
  if (!tokensA.length || !tokensB.length) {
    return false;
  }

  let shared = 0;
  for (const tokenA of tokensA) {
    if (tokensB.some((tokenB) => tokenLooselyMatches(tokenA, tokenB))) {
      shared += 1;
    }
  }

  const minShared = Math.min(tokensA.length, tokensB.length);
  return shared >= minShared || (shared >= 2 && Math.abs(tokensA.length - tokensB.length) <= 2);
}

function lastNameKey(value) {
  const tokens = personTokens(value);
  return tokens.length ? tokens[tokens.length - 1] : "";
}

function bigrams(value) {
  const normalized = normalizeName(value);
  if (normalized.length < 2) {
    return new Set(normalized ? [normalized] : []);
  }
  const result = new Set();
  for (let index = 0; index < normalized.length - 1; index += 1) {
    result.add(normalized.slice(index, index + 2));
  }
  return result;
}

function nameSimilarity(a, b) {
  const gramsA = bigrams(a);
  const gramsB = bigrams(b);
  if (!gramsA.size || !gramsB.size) {
    return 0;
  }

  let shared = 0;
  gramsA.forEach((gram) => {
    if (gramsB.has(gram)) {
      shared += 1;
    }
  });
  return (shared * 2) / (gramsA.size + gramsB.size);
}

function buildFifaIndexLookup() {
  if (cachedFifaIndexLookup) {
    return cachedFifaIndexLookup;
  }

  let payload = null;
  try {
    payload = JSON.parse(fs.readFileSync(FIFA_INDEX_DATA_FILE, "utf8"));
  } catch (_error) {
    cachedFifaIndexLookup = { byExact: new Map(), byName: new Map(), byLastName: new Map(), byTeam: new Map() };
    return cachedFifaIndexLookup;
  }

  const entries = Array.isArray(payload) ? payload : Array.isArray(payload?.players) ? payload.players : [];
  const byExact = new Map();
  const byName = new Map();
  const byLastName = new Map();
  const byTeam = new Map();

  entries.forEach((entry) => {
    const normalizedName = normalizeName(entry.name || "");
    if (!normalizedName) {
      return;
    }

    const normalizedTeam = normalizeName(cleanFifaIndexTeamName(entry.team || ""));
    const normalizedEntry = {
      ...entry,
      team: cleanFifaIndexTeamName(entry.team || ""),
      overall: Number(entry.overall || 0),
      age: Number(entry.age || 24),
      broadPosition: broadPosition(entry.position),
    };

    if (normalizedTeam) {
      const exactKey = `${normalizedName}|${normalizedTeam}`;
      const list = byExact.get(exactKey) || [];
      list.push(normalizedEntry);
      byExact.set(exactKey, list);

      const teamList = byTeam.get(normalizedTeam) || [];
      teamList.push(normalizedEntry);
      byTeam.set(normalizedTeam, teamList);
    }

    const nameList = byName.get(normalizedName) || [];
    nameList.push(normalizedEntry);
    byName.set(normalizedName, nameList);

    const lastToken = lastNameKey(entry.name || "");
    if (lastToken) {
      const lastNameList = byLastName.get(lastToken) || [];
      lastNameList.push(normalizedEntry);
      byLastName.set(lastToken, lastNameList);
    }
  });

  cachedFifaIndexLookup = { byExact, byName, byLastName, byTeam };
  return cachedFifaIndexLookup;
}

function chooseBestFifaIndexEntry(candidates, player, clubProfile, strictClubMatch = false) {
  if (!candidates.length) {
    return null;
  }

  const expectedAge = parseAge(player.birthDate);
  const expectedPosition = broadPosition(player.pos || primaryPosition(player.pos));
  const clubLabels = [clubProfile.name || "", clubProfile.shortName || ""].filter(Boolean);

  const ranked = candidates
    .map((candidate) => {
      const clubMatch = clubLabels.some((label) => clubsRoughlyMatch(label, candidate.team || ""));
      const ageGap = Math.abs((candidate.age || expectedAge) - expectedAge);
      const positionPenalty = candidate.broadPosition && candidate.broadPosition !== expectedPosition ? 4 : 0;
      const clubPenalty = strictClubMatch ? (clubMatch ? 0 : 12) : (clubMatch ? 0 : 6);
      return {
        candidate,
        score: ageGap + positionPenalty + clubPenalty,
      };
    })
    .sort((a, b) => a.score - b.score || b.candidate.overall - a.candidate.overall);

  if (!ranked.length || ranked[0].score > (strictClubMatch ? 12 : 8)) {
    return null;
  }
  return ranked[0].candidate;
}

function findClubScopedFifaCandidates(lookup, clubProfile) {
  const candidates = [];
  lookup.byTeam.forEach((players) => {
    if (players.length && [clubProfile.name, clubProfile.shortName].filter(Boolean).some((label) => clubsRoughlyMatch(label, players[0]?.team || ""))) {
      candidates.push(...players);
    }
  });
  return candidates;
}

function buildFifaAttributeTargets(overall, position) {
  if (position === "G") {
    return {
      attack: 12,
      defense: clamp(overall - 16, 20, 78),
      passing: clamp(overall - 18, 18, 75),
      stamina: clamp(overall - 7, 35, 84),
      goalkeeping: clamp(overall + 5, 48, 96),
    };
  }

  if (position === "D") {
    return {
      attack: clamp(overall - 10, 18, 84),
      defense: clamp(overall + 6, 40, 95),
      passing: clamp(overall - 2, 25, 88),
      stamina: clamp(overall + 2, 38, 94),
      goalkeeping: 12,
    };
  }

  if (position === "F") {
    return {
      attack: clamp(overall + 7, 36, 95),
      defense: clamp(overall - 12, 12, 70),
      passing: clamp(overall + 1, 26, 92),
      stamina: clamp(overall, 34, 92),
      goalkeeping: 11,
    };
  }

  return {
    attack: clamp(overall + 1, 24, 92),
    defense: clamp(overall - 1, 20, 88),
    passing: clamp(overall + 5, 32, 95),
    stamina: clamp(overall + 2, 38, 94),
    goalkeeping: 12,
  };
}

function recalculateEconomicsForOverall(overall, tier) {
  return {
    wage: Math.round(overall * overall * (tier === 1 ? 44 : 29)),
    value: Math.round(overall * overall * overall * (tier === 1 ? 110 : 82)),
  };
}

function applyFifaIndexRating(player, clubProfile, attributes) {
  const lookup = buildFifaIndexLookup();
  if (!lookup.byName.size) {
    return { ...attributes, source: "statscrew-profile" };
  }

  const normalizedName = normalizeName(player.name || "");
  if (!normalizedName) {
    return { ...attributes, source: "statscrew-profile" };
  }

  const exactCandidates = [
    lookup.byExact.get(`${normalizedName}|${normalizeName(cleanFifaIndexTeamName(clubProfile.name || ""))}`) || [],
    lookup.byExact.get(`${normalizedName}|${normalizeName(cleanFifaIndexTeamName(clubProfile.shortName || ""))}`) || [],
  ].flat();

  const fifaEntry =
    chooseBestFifaIndexEntry(exactCandidates, player, clubProfile, true) ||
    chooseBestFifaIndexEntry(lookup.byName.get(normalizedName) || [], player, clubProfile, false) ||
    chooseBestFifaIndexEntry(
      (lookup.byLastName.get(lastNameKey(player.name || "")) || []).filter((candidate) => namesRoughlyMatch(player.name || "", candidate.name || "")),
      player,
      clubProfile,
      false
    ) ||
    chooseBestFifaIndexEntry(
      findClubScopedFifaCandidates(lookup, clubProfile).filter((candidate) => {
        const similarity = nameSimilarity(player.name || "", candidate.name || "");
        const positionMatch =
          !candidate.broadPosition ||
          candidate.broadPosition === broadPosition(player.pos || primaryPosition(player.pos));
        const ageGap = Math.abs(Number(candidate.age || parseAge(player.birthDate)) - parseAge(player.birthDate));
        return positionMatch && ageGap <= 3 && similarity >= 0.58;
      }),
      player,
      clubProfile,
      false
    );

  if (!fifaEntry?.overall) {
    return { ...attributes, source: "statscrew-profile" };
  }

  const position = fifaEntry.broadPosition || broadPosition(player.pos || primaryPosition(player.pos));
  const targets = buildFifaAttributeTargets(fifaEntry.overall, position);
  const blend = (base, target, min, max) => clamp(Math.round(base * 0.38 + target * 0.62), min, max);
  const economics = recalculateEconomicsForOverall(fifaEntry.overall, clubProfile.tier);

  return {
    ...attributes,
    overall: fifaEntry.overall,
    attack: blend(attributes.attack, targets.attack, 10, 95),
    defense: blend(attributes.defense, targets.defense, 10, 95),
    passing: blend(attributes.passing, targets.passing, 10, 95),
    stamina: blend(attributes.stamina, targets.stamina, 24, 96),
    goalkeeping: blend(attributes.goalkeeping, targets.goalkeeping, 10, 96),
    wage: economics.wage,
    value: economics.value,
    source: "fifaindex-fifa08-list",
  };
}

function buildFifaTeamRoster(clubProfile, minSize = 24) {
  const lookup = buildFifaIndexLookup();
  if (!lookup.byTeam.size) {
    return [];
  }

  const teamEntries = [...lookup.byTeam.entries()]
    .map(([teamKey, players]) => ({
      teamKey,
      players,
      score:
        clubsRoughlyMatch(clubProfile.name, players[0]?.team || "") ? 0 :
        clubsRoughlyMatch(clubProfile.shortName, players[0]?.team || "") ? 1 :
        10,
    }))
    .filter((entry) => entry.score < 10)
    .sort((a, b) => a.score - b.score || b.players.length - a.players.length);

  if (!teamEntries.length) {
    return [];
  }

  const squad = [...teamEntries[0].players]
    .sort((a, b) => b.overall - a.overall || a.age - b.age)
    .slice(0, Math.max(minSize, 24))
    .map((entry) => {
      const position = broadPosition(entry.position);
      const targets = buildFifaAttributeTargets(entry.overall, position);
      const economics = recalculateEconomicsForOverall(entry.overall, clubProfile.tier);
      return {
        name: entry.name,
        pos: position,
        secondaryPositions: secondaryPositions(entry.position || position),
        nationality: entry.nationality || clubProfile.country,
        birthDate: "",
        hometown: "",
        gp: 0,
        gs: 0,
        minutes: 0,
        goals: 0,
        assists: 0,
        yellow: 0,
        red: 0,
        shots: 0,
        shotsOnGoal: 0,
        age: clamp(Number(entry.age || 24), 16, 40),
        overall: entry.overall,
        attack: targets.attack,
        defense: targets.defense,
        passing: targets.passing,
        stamina: targets.stamina,
        goalkeeping: targets.goalkeeping,
        wage: economics.wage,
        value: economics.value,
        source: "fifaindex-fifa08-team",
      };
    });

  return squad;
}

function hashString(input) {
  let hash = 0;
  for (const char of input) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash);
}

function deterministicRange(seed, min, max) {
  const hash = hashString(seed || "seed");
  const span = max - min + 1;
  return min + (hash % span);
}

function colorPairFromName(name) {
  const hash = hashString(name);
  const hueA = hash % 360;
  const hueB = (hueA + 42) % 360;
  return [
    `hsl(${hueA} 72% 46%)`,
    `hsl(${hueB} 74% 36%)`,
  ];
}

function ensureCacheDir() {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    return true;
  } catch (_error) {
    return false;
  }
}

function cachePathFor(url) {
  const safe = url.replace(/[^a-zA-Z0-9]+/g, "_").replace(/_+/g, "_");
  return path.join(CACHE_DIR, `${safe}.html`);
}

async function fetchText(url) {
  const canUseCache = ensureCacheDir();
  const cached = canUseCache ? cachePathFor(url) : null;
  if (cached && fs.existsSync(cached)) {
    return fs.readFileSync(cached, "utf8");
  }

  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 Codex Historical Importer",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const text = await response.text();
  if (cached) {
    try {
      fs.writeFileSync(cached, text, "utf8");
    } catch (_error) {
      // Ignore cache write failures in read-only/serverless environments.
    }
  }
  return text;
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await mapper(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function decodeHtml(fragment) {
  const $ = cheerio.load(`<div>${fragment}</div>`);
  return $("div").text().trim();
}

function parseLeagueTeams(html, competition) {
  const $ = cheerio.load(html);
  const teams = [];

  $("p").each((_, element) => {
    const sectionHtml = $(element).html();
    if (!sectionHtml || !sectionHtml.includes("/roster/")) {
      return;
    }

    const parts = sectionHtml.split(/<br\s*\/?>/i);
    for (const part of parts) {
      const match = part.match(
        /^(.+?)\s+\((\d+)-(\d+)-(\d+)\)\s+-\s+<a href="([^"]*\/roster\/[^"]+)">Roster<\/a>\s+\|\s+<a href="([^"]*\/stats\/[^"]+)">Statistics<\/a>/i
      );
      if (!match) {
        continue;
      }

      const clubName = decodeHtml(match[1]);
      teams.push({
        country: competition.country,
        leagueName: competition.name,
        tier: competition.tier,
        season: SEASON_LABEL,
        name: clubName,
        shortName: clubName.replace(/\s+(Football Club|FC|CF|AC|SC)$/i, "").trim(),
        wins: Number(match[2]),
        draws: Number(match[3]),
        losses: Number(match[4]),
        rosterUrl: match[5].startsWith("http") ? match[5] : `https://www.statscrew.com${match[5]}`,
        statsUrl: match[6].startsWith("http") ? match[6] : `https://www.statscrew.com${match[6]}`,
      });
    }
  });

  return teams;
}

function parseRosterPlayers(html) {
  const $ = cheerio.load(html);
  const rows = [];

  $("table tr").each((_, tr) => {
    const cells = $(tr)
      .find("th,td")
      .map((__, cell) => $(cell).text().trim().replace(/\s+/g, " "))
      .get();
    if (cells.length === 6 && cells[0] !== "Player") {
      rows.push({
        name: cells[0],
        pos: cells[1],
        birthDate: cells[2],
        height: cells[3],
        weight: cells[4],
        hometown: cells[5],
      });
    }
  });

  return rows;
}

function parseStatsPlayers(html) {
  const $ = cheerio.load(html);
  const rows = [];

  $("table tr").each((_, tr) => {
    const cells = $(tr)
      .find("th,td")
      .map((__, cell) => $(cell).text().trim().replace(/\s+/g, " "))
      .get();

    if (cells.length >= 15 && cells[0] !== "Player") {
      rows.push({
        name: cells[0],
        pos: cells[1],
        gp: Number(cells[2] || 0),
        gs: Number(cells[3] || 0),
        minutes: Number(cells[4] || 0),
        goals: Number(cells[5] || 0),
        assists: Number(cells[6] || 0),
        foulsCommitted: Number(cells[7] || 0),
        foulsSuffered: Number(cells[8] || 0),
        yellow: Number(cells[9] || 0),
        red: Number(cells[10] || 0),
        shots: Number(cells[11] || 0),
        shotsOnGoal: Number(cells[13] || 0),
      });
    }
  });

  return rows;
}

function parseAge(birthDate) {
  if (!birthDate) {
    return 24;
  }

  const timestamp = Date.parse(birthDate);
  if (Number.isNaN(timestamp)) {
    return 24;
  }

  const birth = new Date(timestamp);
  const seasonStart = new Date("2007-08-01");
  let age = seasonStart.getFullYear() - birth.getFullYear();
  const hadBirthday =
    seasonStart.getMonth() > birth.getMonth() ||
    (seasonStart.getMonth() === birth.getMonth() && seasonStart.getDate() >= birth.getDate());
  if (!hadBirthday) {
    age -= 1;
  }
  return clamp(age, 16, 40);
}

function extractCountryFromHometown(hometown, fallbackCountry) {
  if (!hometown || !hometown.includes(",")) {
    return fallbackCountry;
  }

  const parts = hometown.split(",");
  return parts[parts.length - 1].trim() || fallbackCountry;
}

function primaryPosition(rawPos) {
  const token = (rawPos || "M")
    .split(",")
    .map((value) => value.trim())
    .find(Boolean);
  return token || "M";
}

function secondaryPositions(rawPos) {
  const parts = (rawPos || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return JSON.stringify(parts);
}

function calculateClubNumbers(team) {
  const points = team.wins * 3 + team.draws;
  const strength = clamp(45 + points * 0.32 + (team.tier === 1 ? 12 : 0), 52, 92);
  const reputation = clamp(strength + (team.tier === 1 ? 5 : -2), 50, 95);
  const stadiumCapacity = Math.round(9000 + strength * 850 + team.tier * 2500);
  const ticketPrice = clamp(Math.round(12 + strength * 0.22), 10, 32);
  const balance = Math.round(3500000 + strength * strength * (team.tier === 1 ? 10000 : 6500));
  return { points, strength, reputation, stadiumCapacity, ticketPrice, balance };
}

function calculatePlayerAttributes(player, club) {
  const pos = primaryPosition(player.pos);
  const age = parseAge(player.birthDate);
  const minutes = Number(player.minutes) || 0;
  const appearances = Number(player.gp) || 0;
  const goals = Number(player.goals) || 0;
  const assists = Number(player.assists) || 0;
  const minutesFactor = clamp(minutes / 3200, 0, 1);
  const appearanceFactor = clamp(appearances / 38, 0, 1);
  const goalFactor = clamp(goals / 20, 0, 1);
  const assistFactor = clamp(assists / 12, 0, 1);
  const ageCurve =
    age <= 22 ? 2 + (22 - age) * 0.45 :
    age <= 29 ? 4 :
    -Math.min(7, (age - 29) * 0.85);
  const seed = `${player.name || "player"}|${player.birthDate || ""}|${club.name}|${pos}`;
  const talentNoise = deterministicRange(seed, -4, 4);
  const formNoise = deterministicRange(`${seed}|form`, -2, 2);
  const tierOffset = club.tier === 1 ? 3 : -3;
  const baseAbility =
    49 +
    club.strength * 0.37 +
    tierOffset +
    ageCurve +
    minutesFactor * 8 +
    appearanceFactor * 5 +
    talentNoise +
    formNoise;

  let attack = 44;
  let defense = 44;
  let passing = 46;
  let stamina = 50;
  let goalkeeping = 12;
  let overall = baseAbility;

  if (pos === "G") {
    goalkeeping = 58 + baseAbility * 0.42 + appearanceFactor * 8 + deterministicRange(`${seed}|gk`, -3, 3);
    defense = 34 + baseAbility * 0.2 + appearanceFactor * 4;
    passing = 28 + baseAbility * 0.16 + assistFactor * 4;
    attack = 10 + deterministicRange(`${seed}|atk`, 0, 4);
    stamina = 42 + baseAbility * 0.12;
    overall = goalkeeping * 0.58 + defense * 0.16 + passing * 0.1 + stamina * 0.06 + 13;
  } else if (pos === "D") {
    defense = 38 + baseAbility * 0.48 + minutesFactor * 8 + deterministicRange(`${seed}|def`, -3, 3);
    passing = 31 + baseAbility * 0.31 + assistFactor * 8;
    attack = 23 + baseAbility * 0.2 + goalFactor * 7;
    stamina = 38 + baseAbility * 0.4 + minutesFactor * 6;
    overall = defense * 0.4 + passing * 0.22 + stamina * 0.16 + attack * 0.14 + 8;
  } else if (pos === "M") {
    passing = 36 + baseAbility * 0.46 + assistFactor * 10 + deterministicRange(`${seed}|pas`, -3, 3);
    attack = 31 + baseAbility * 0.35 + goalFactor * 9;
    defense = 28 + baseAbility * 0.29 + minutesFactor * 5;
    stamina = 40 + baseAbility * 0.41 + minutesFactor * 6;
    overall = passing * 0.34 + attack * 0.24 + defense * 0.18 + stamina * 0.18 + 9;
  } else {
    attack = 41 + baseAbility * 0.48 + goalFactor * 13 + deterministicRange(`${seed}|fin`, -3, 3);
    passing = 28 + baseAbility * 0.31 + assistFactor * 9;
    defense = 20 + baseAbility * 0.18 + appearanceFactor * 3;
    stamina = 34 + baseAbility * 0.37 + minutesFactor * 5;
    overall = attack * 0.42 + passing * 0.2 + stamina * 0.18 + defense * 0.1 + 12;
  }

  overall = clamp(Math.round(overall), 49, 92);

  return {
    age,
    overall,
    attack: clamp(Math.round(attack), 10, 95),
    defense: clamp(Math.round(defense), 10, 95),
    passing: clamp(Math.round(passing), 10, 95),
    stamina: clamp(Math.round(stamina), 24, 96),
    goalkeeping: clamp(Math.round(goalkeeping), 10, 96),
    wage: Math.round(overall * overall * (club.tier === 1 ? 44 : 29)),
    value: Math.round(overall * overall * overall * (club.tier === 1 ? 110 : 82)),
  };
}

function generateFallbackRoster(club, minSize = 24) {
  const pool = NAME_POOLS[club.country] || NAME_POOLS.England;
  const slots = ["G", "G", "D", "D", "D", "D", "D", "D", "M", "M", "M", "M", "M", "M", "M", "F", "F", "F", "F", "M", "D", "M", "F", "D"];

  return Array.from({ length: minSize }, (_, index) => {
    const name = `${pool.first[index % pool.first.length]} ${pool.last[(index * 3) % pool.last.length]}`;
    const pos = slots[index % slots.length];
    const player = {
      name,
      pos,
      birthDate: `${["January", "March", "May", "July", "September", "November"][index % 6]} ${10 + (index % 18)}, ${1980 + (index % 10)}`,
      hometown: `${club.country}`,
      gp: clamp(8 + index, 0, 34),
      gs: clamp(5 + index, 0, 32),
      minutes: 400 + index * 60,
      goals: pos === "F" ? Math.max(0, 10 - (index % 6)) : pos === "M" ? Math.max(0, 6 - (index % 4)) : 0,
      assists: pos === "M" ? Math.max(0, 8 - (index % 4)) : pos === "F" ? Math.max(0, 5 - (index % 4)) : 0,
      yellow: index % 4,
      red: index % 17 === 0 ? 1 : 0,
      shots: pos === "F" ? 30 - index : pos === "M" ? 18 - index / 2 : 4,
      shotsOnGoal: pos === "F" ? 14 - index / 2 : 6,
    };

    const attributes = calculatePlayerAttributes(player, club);
    return {
      ...player,
      nationality: club.country,
      secondaryPositions: secondaryPositions(pos),
      ...attributes,
    };
  });
}

async function importClubData(team, clubProfile) {
  try {
    const [rosterHtml, statsHtml] = await Promise.all([
      fetchText(team.rosterUrl),
      fetchText(team.statsUrl),
    ]);

    const rosterRows = parseRosterPlayers(rosterHtml);
    const statsRows = parseStatsPlayers(statsHtml);
    const statsByName = new Map(statsRows.map((row) => [normalizeName(row.name), row]));

    const players = rosterRows.map((row) => {
      const stats = statsByName.get(normalizeName(row.name)) || {};
      const merged = {
        ...row,
        ...stats,
        pos: row.pos || stats.pos || "M",
      };
      const attributes = applyFifaIndexRating(merged, clubProfile, calculatePlayerAttributes(merged, clubProfile));
      return {
        name: merged.name,
        pos: primaryPosition(merged.pos),
        secondaryPositions: secondaryPositions(merged.pos),
        nationality: extractCountryFromHometown(merged.hometown, clubProfile.country),
        birthDate: merged.birthDate || "",
        hometown: merged.hometown || "",
        gp: merged.gp || 0,
        gs: merged.gs || 0,
        minutes: merged.minutes || 0,
        goals: merged.goals || 0,
        assists: merged.assists || 0,
        yellow: merged.yellow || 0,
        red: merged.red || 0,
        shots: merged.shots || 0,
        shotsOnGoal: merged.shotsOnGoal || 0,
        source: attributes.source || "statscrew-profile",
        ...attributes,
      };
    });

    const fifaRoster = buildFifaTeamRoster(clubProfile, 24);
    if (fifaRoster.length >= 18) {
      return fifaRoster.map((candidate) => {
        const statsMatch = players.find((player) => namesRoughlyMatch(player.name, candidate.name));
        if (!statsMatch) {
          return candidate;
        }

        return {
          ...statsMatch,
          name: candidate.name,
          pos: candidate.pos,
          secondaryPositions: candidate.secondaryPositions,
          age: candidate.age,
          overall: candidate.overall,
          attack: candidate.attack,
          defense: candidate.defense,
          passing: candidate.passing,
          stamina: candidate.stamina,
          goalkeeping: candidate.goalkeeping,
          wage: candidate.wage,
          value: candidate.value,
          source: candidate.source,
        };
      });
    }

    if (players.length >= 18) {
      return players;
    }

    const fifaFallback = fifaRoster.filter(
      (candidate) => !players.some((player) => namesRoughlyMatch(player.name, candidate.name))
    );
    if (fifaFallback.length) {
      return [...players, ...fifaFallback].slice(0, 28);
    }

    return [...players, ...generateFallbackRoster(clubProfile, 24 - players.length)];
  } catch (error) {
    const fifaRoster = buildFifaTeamRoster(clubProfile, 24);
    if (fifaRoster.length) {
      return fifaRoster;
    }
    return generateFallbackRoster(clubProfile);
  }
}

async function importHistoricalSeason() {
  const leagues = [];
  const clubs = [];
  const players = [];
  let leagueId = 1;
  let clubId = 1;
  let playerId = 1;

  for (const competition of COMPETITIONS) {
    const league = {
      id: leagueId++,
      country: competition.country,
      name: competition.name,
      tier: competition.tier,
      season: SEASON_LABEL,
      slug: `${toSlug(competition.country)}-${toSlug(competition.name)}`,
    };
    leagues.push(league);

    const leagueHtml = await fetchText(competition.url);
    const teams = parseLeagueTeams(leagueHtml, competition);

    const importedTeams = await mapLimit(teams, 8, async (team, index) => {
      const numbers = calculateClubNumbers(team);
      const [primaryColor, secondaryColor] = colorPairFromName(team.name);
      const profile = {
        id: clubId + index,
        leagueId: league.id,
        country: competition.country,
        tier: competition.tier,
        name: team.name,
        shortName: team.shortName,
        points: numbers.points,
        strength: numbers.strength,
        reputation: numbers.reputation,
        stadiumCapacity: numbers.stadiumCapacity,
        ticketPrice: numbers.ticketPrice,
        balance: numbers.balance,
        boardExpectation:
          numbers.strength >= 82
            ? "Fight for the title"
            : numbers.strength >= 74
            ? "Push for promotion or Europe"
            : numbers.strength >= 66
            ? "Secure a strong mid-table finish"
            : "Avoid a disappointing season",
        logoPrimary: primaryColor,
        logoSecondary: secondaryColor,
        rosterUrl: team.rosterUrl,
        statsUrl: team.statsUrl,
      };
      const squad = await importClubData(team, profile);
      return { club: profile, squad };
    });

    for (const importedTeam of importedTeams) {
      const club = importedTeam.club;
      clubs.push(club);
      clubId += 1;

      for (const player of importedTeam.squad) {
        players.push({
          id: playerId++,
          clubId: club.id,
          name: player.name,
          position: player.pos,
          secondaryPositions: player.secondaryPositions,
          nationality: player.nationality,
          birthDate: player.birthDate,
          hometown: player.hometown,
          age: player.age,
          overall: player.overall,
          attack: player.attack,
          defense: player.defense,
          passing: player.passing,
          stamina: player.stamina,
          goalkeeping: player.goalkeeping,
          wage: player.wage,
          value: player.value,
          morale: 70,
          fitness: clamp(85 - Math.round(player.age / 2), 72, 96),
          goals: player.goals || 0,
          assists: player.assists || 0,
          yellowCards: player.yellow || 0,
          redCards: player.red || 0,
          appearances: player.gp || 0,
          starts: player.gs || 0,
          minutes: player.minutes || 0,
          shots: player.shots || 0,
          shotsOnGoal: player.shotsOnGoal || 0,
          source: player.source || "statscrew-profile",
        });
      }
    }
  }

  return { leagues, clubs, players };
}

module.exports = {
  COMPETITIONS,
  SEASON_LABEL,
  importHistoricalSeason,
  toSlug,
  clamp,
  primaryPosition,
  colorPairFromName,
};


