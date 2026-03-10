const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const CACHE_DIR = path.join(__dirname, "..", ".cache", "historical");
const SEASON_LABEL = "2007-08";

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
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function cachePathFor(url) {
  const safe = url.replace(/[^a-zA-Z0-9]+/g, "_").replace(/_+/g, "_");
  return path.join(CACHE_DIR, `${safe}.html`);
}

async function fetchText(url) {
  ensureCacheDir();
  const cached = cachePathFor(url);
  if (fs.existsSync(cached)) {
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
  fs.writeFileSync(cached, text, "utf8");
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
      const attributes = calculatePlayerAttributes(merged, clubProfile);
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
        ...attributes,
      };
    });

    if (players.length >= 18) {
      return players;
    }

    return [...players, ...generateFallbackRoster(clubProfile, 24 - players.length)];
  } catch (error) {
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
          source: "statscrew-fifa08-profile",
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


