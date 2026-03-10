const path = require("path");
const Database = require("better-sqlite3");
const { importHistoricalSeason, SEASON_LABEL, clamp } = require("./historicalData");
const { REFEREES, buildSpeechOptions, generateWeather } = require("./content");
const {
  FORMATIONS,
  MENTALITY_MODIFIERS,
  STYLE_MODIFIERS,
  pickBestLineup,
  createLiveState,
  simulateMinute,
  simulateInstantMatch,
  fastForwardMatch,
  applyMatchAction,
} = require("./matchEngine");

const DB_PATH = path.join(__dirname, "..", "data.sqlite");
const db = new Database(DB_PATH);
const KNOCKOUT_STAGE_SEQUENCE = ["1/8 финала", "1/4 финала", "1/2 финала", "Финал"];

function currentLanguage() {
  const manager = db.prepare("SELECT language FROM manager WHERE id = 1").get();
  return manager?.language === "en" ? "en" : "ru";
}

function localize(ru, en) {
  return currentLanguage() === "en" ? en : ru;
}

function formatMoney(value) {
  return Math.round(value || 0).toLocaleString("en-US");
}

function countryCupName(country) {
  const names = {
    England: { ru: "Кубок Англии", en: "England Cup" },
    France: { ru: "Кубок Франции", en: "France Cup" },
    Portugal: { ru: "Кубок Португалии", en: "Portugal Cup" },
    Italy: { ru: "Кубок Италии", en: "Italy Cup" },
    Spain: { ru: "Кубок Испании", en: "Spain Cup" },
    Germany: { ru: "Кубок Германии", en: "Germany Cup" },
    Russia: { ru: "Кубок России", en: "Russia Cup" },
  };
  const entry = names[country] || { ru: `${country} Кубок`, en: `${country} Cup` };
  return localize(entry.ru, entry.en);
}

function competitionDisplayName(competitionType, country = "") {
  if (competitionType === "champions") {
    return localize("Лига чемпионов", "Champions League");
  }
  if (competitionType === "uefa") {
    return localize("Кубок УЕФА", "UEFA Cup");
  }
  if (competitionType === "cup") {
    return countryCupName(country);
  }
  return "";
}

function ensureColumn(tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function createSchema() {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS seed_leagues (
      id INTEGER PRIMARY KEY,
      country TEXT NOT NULL,
      name TEXT NOT NULL,
      tier INTEGER NOT NULL,
      season TEXT NOT NULL,
      slug TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seed_clubs (
      id INTEGER PRIMARY KEY,
      league_id INTEGER NOT NULL,
      country TEXT NOT NULL,
      tier INTEGER NOT NULL,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      points INTEGER NOT NULL,
      strength INTEGER NOT NULL,
      reputation INTEGER NOT NULL,
      stadium_capacity INTEGER NOT NULL,
      ticket_price INTEGER NOT NULL,
      balance INTEGER NOT NULL,
      board_expectation TEXT NOT NULL,
      logo_primary TEXT NOT NULL,
      logo_secondary TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seed_players (
      id INTEGER PRIMARY KEY,
      club_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      secondary_positions TEXT NOT NULL,
      nationality TEXT NOT NULL,
      birth_date TEXT,
      hometown TEXT,
      age INTEGER NOT NULL,
      overall INTEGER NOT NULL,
      attack INTEGER NOT NULL,
      defense INTEGER NOT NULL,
      passing INTEGER NOT NULL,
      stamina INTEGER NOT NULL,
      goalkeeping INTEGER NOT NULL,
      wage INTEGER NOT NULL,
      value INTEGER NOT NULL,
      source TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leagues (
      id INTEGER PRIMARY KEY,
      country TEXT NOT NULL,
      name TEXT NOT NULL,
      tier INTEGER NOT NULL,
      season TEXT NOT NULL,
      slug TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY,
      league_id INTEGER NOT NULL,
      country TEXT NOT NULL,
      tier INTEGER NOT NULL,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      strength INTEGER NOT NULL,
      reputation INTEGER NOT NULL,
      stadium_capacity INTEGER NOT NULL,
      ticket_price INTEGER NOT NULL,
      balance INTEGER NOT NULL,
      board_expectation TEXT NOT NULL,
      logo_primary TEXT NOT NULL,
      logo_secondary TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY,
      club_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      secondary_positions TEXT NOT NULL,
      nationality TEXT NOT NULL,
      birth_date TEXT,
      hometown TEXT,
      age INTEGER NOT NULL,
      overall INTEGER NOT NULL,
      attack INTEGER NOT NULL,
      defense INTEGER NOT NULL,
      passing INTEGER NOT NULL,
      stamina INTEGER NOT NULL,
      goalkeeping INTEGER NOT NULL,
      wage INTEGER NOT NULL,
      value INTEGER NOT NULL,
      morale INTEGER NOT NULL DEFAULT 70,
      fitness INTEGER NOT NULL DEFAULT 90,
      goals INTEGER NOT NULL DEFAULT 0,
      assists INTEGER NOT NULL DEFAULT 0,
      yellow_cards INTEGER NOT NULL DEFAULT 0,
      red_cards INTEGER NOT NULL DEFAULT 0,
      appearances INTEGER NOT NULL DEFAULT 0,
      starts INTEGER NOT NULL DEFAULT 0,
      minutes INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS club_tactics (
      club_id INTEGER PRIMARY KEY,
      formation TEXT NOT NULL,
      mentality TEXT NOT NULL,
      style TEXT NOT NULL,
      lineup_json TEXT NOT NULL,
      bench_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fixtures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league_id INTEGER NOT NULL,
      round_no INTEGER NOT NULL,
      home_club_id INTEGER NOT NULL,
      away_club_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      home_score INTEGER DEFAULT 0,
      away_score INTEGER DEFAULT 0,
      stats_json TEXT,
      events_json TEXT
    );

    CREATE TABLE IF NOT EXISTS manager (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      manager_name TEXT NOT NULL,
      club_id INTEGER NOT NULL,
      cash INTEGER NOT NULL,
      board_confidence INTEGER NOT NULL,
      ticket_price INTEGER NOT NULL,
      stadium_capacity INTEGER NOT NULL,
      fan_mood INTEGER NOT NULL,
      current_round INTEGER NOT NULL,
      last_summary_json TEXT,
      job_status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS transfer_market (
      player_id INTEGER PRIMARY KEY,
      seller_club_id INTEGER NOT NULL,
      asking_price INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS finance_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      round_no INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS live_match (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      fixture_id INTEGER NOT NULL,
      state_json TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS transfer_offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      direction TEXT NOT NULL,
      player_id INTEGER NOT NULL,
      seller_club_id INTEGER NOT NULL,
      buyer_club_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      asking_price INTEGER NOT NULL,
      proposed_fee INTEGER NOT NULL,
      response_fee INTEGER,
      message TEXT,
      submitted_round INTEGER NOT NULL,
      response_round INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS save_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ensureColumn("fixtures", "match_date", "TEXT");
  ensureColumn("fixtures", "competition_type", "TEXT DEFAULT 'league'");
  ensureColumn("fixtures", "competition_name", "TEXT");
  ensureColumn("fixtures", "competition_stage", "TEXT");
  ensureColumn("fixtures", "weather_json", "TEXT");
  ensureColumn("fixtures", "referee", "TEXT");
  ensureColumn("fixtures", "attendance_estimate", "INTEGER DEFAULT 0");
  ensureColumn("fixtures", "winner_club_id", "INTEGER");
  ensureColumn("fixtures", "result_note", "TEXT");
  ensureColumn("manager", "language", "TEXT DEFAULT 'ru'");
}

function getMeta(key) {
  return db.prepare("SELECT value FROM meta WHERE key = ?").get(key)?.value || null;
}

function setMeta(key, value) {
  db.prepare(`
    INSERT INTO meta (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

function clearSeedTables() {
  db.exec(`
    DELETE FROM seed_players;
    DELETE FROM seed_clubs;
    DELETE FROM seed_leagues;
  `);
}

function clearRuntimeTables() {
  db.exec(`
    DELETE FROM live_match;
    DELETE FROM transfer_offers;
    DELETE FROM finance_entries;
    DELETE FROM transfer_market;
    DELETE FROM fixtures;
    DELETE FROM club_tactics;
    DELETE FROM players;
    DELETE FROM clubs;
    DELETE FROM leagues;
    DELETE FROM manager;
  `);
}

function writeSeedData(data) {
  clearSeedTables();
  const insertLeague = db.prepare(`
    INSERT INTO seed_leagues (id, country, name, tier, season, slug)
    VALUES (@id, @country, @name, @tier, @season, @slug)
  `);
  const insertClub = db.prepare(`
    INSERT INTO seed_clubs (
      id, league_id, country, tier, name, short_name, points, strength, reputation,
      stadium_capacity, ticket_price, balance, board_expectation, logo_primary, logo_secondary
    ) VALUES (
      @id, @leagueId, @country, @tier, @name, @shortName, @points, @strength, @reputation,
      @stadiumCapacity, @ticketPrice, @balance, @boardExpectation, @logoPrimary, @logoSecondary
    )
  `);
  const insertPlayer = db.prepare(`
    INSERT INTO seed_players (
      id, club_id, name, position, secondary_positions, nationality, birth_date, hometown, age,
      overall, attack, defense, passing, stamina, goalkeeping, wage, value, source
    ) VALUES (
      @id, @clubId, @name, @position, @secondaryPositions, @nationality, @birthDate, @hometown, @age,
      @overall, @attack, @defense, @passing, @stamina, @goalkeeping, @wage, @value, @source
    )
  `);

  const transaction = db.transaction(() => {
    data.leagues.forEach((league) => insertLeague.run(league));
    data.clubs.forEach((club) => insertClub.run(club));
    data.players.forEach((player) => insertPlayer.run(player));
  });
  transaction();
  setMeta("seed_version", "2");
  setMeta("seed_season", SEASON_LABEL);
}

async function ensureHistoricalSeed() {
  if (getMeta("seed_version") === "2") {
    return;
  }

  const imported = await importHistoricalSeason();
  writeSeedData(imported);
}

function getSeedClubList() {
  return db
    .prepare(`
      SELECT
        c.id,
        c.name,
        c.short_name AS shortName,
        c.country,
        l.name AS leagueName,
        l.tier,
        c.strength,
        c.board_expectation AS boardExpectation,
        c.logo_primary AS logoPrimary,
        c.logo_secondary AS logoSecondary
      FROM seed_clubs c
      JOIN seed_leagues l ON l.id = c.league_id
      ORDER BY c.country, l.tier, c.name
    `)
    .all();
}

function circleSchedule(teamIds) {
  const teams = [...teamIds];
  if (teams.length % 2 === 1) {
    teams.push(null);
  }

  const rounds = [];
  const rotating = [...teams];
  const totalRounds = rotating.length - 1;
  const half = rotating.length / 2;

  for (let round = 0; round < totalRounds; round += 1) {
    const pairings = [];
    for (let index = 0; index < half; index += 1) {
      const home = rotating[index];
      const away = rotating[rotating.length - 1 - index];
      if (home && away) {
        const reverse = round % 2 === 1;
        pairings.push(reverse ? [away, home] : [home, away]);
      }
    }
    rounds.push(pairings);
    rotating.splice(1, 0, rotating.pop());
  }

  return rounds.concat(rounds.map((round) => round.map(([home, away]) => [away, home])));
}

function buildRoundDate(roundNo) {
  const start = new Date("2007-08-11T15:00:00Z");
  const date = new Date(start);
  date.setUTCDate(start.getUTCDate() + (roundNo - 1) * 7);
  return date.toISOString().slice(0, 10);
}

function buildFixtureMeta(league, roundNo, homeClub, awayClub, overrides = {}) {
  const weather = generateWeather();
  const referee = REFEREES[Math.floor(Math.random() * REFEREES.length)];
  const interestFactor = clamp((homeClub.reputation + awayClub.reputation) / 200, 0.55, 1.15);
  const attendanceEstimate = Math.round(homeClub.stadium_capacity * clamp(0.42 + interestFactor * 0.36, 0.35, 0.97));
  return {
    matchDate: buildRoundDate(roundNo),
    competitionType: overrides.competitionType || "league",
    competitionName: overrides.competitionName || league.name,
    competitionStage: overrides.competitionStage || overrides.stage || null,
    weather,
    referee,
    attendanceEstimate,
  };
}

function buildDefaultTacticForClub(clubId) {
  const players = db
    .prepare("SELECT * FROM players WHERE club_id = ? ORDER BY overall DESC, age ASC")
    .all(clubId);
  const setup = pickBestLineup(players, "4-4-2");
  db.prepare(`
    INSERT INTO club_tactics (club_id, formation, mentality, style, lineup_json, bench_json)
    VALUES (?, '4-4-2', 'balanced', 'possession', ?, ?)
  `).run(clubId, JSON.stringify(setup.starters.map((player) => player.id)), JSON.stringify(setup.bench.map((player) => player.id)));
}

function groupByCountry(clubs) {
  return clubs.reduce((map, club) => {
    if (!map.has(club.country)) {
      map.set(club.country, []);
    }
    map.get(club.country).push(club);
    return map;
  }, new Map());
}

function pickAiSetup(players) {
  const formations = Object.keys(FORMATIONS);
  const normalized = players.map((player) => ({
    ...player,
    secondaryList: (() => {
      try {
        return JSON.parse(player.secondary_positions || "[]");
      } catch (_error) {
        return [];
      }
    })(),
  }));

  let best = null;
  formations.forEach((formation) => {
    const picked = pickBestLineup(players, formation);
    const starters = picked.starters;
    const fitScore = starters.reduce((sum, player, index) => {
      const slot = FORMATIONS[formation][index];
      const fitBonus =
        player.position === slot ? 12 :
        (player.secondaryList || []).includes(slot) ? 7 :
        1;
      return sum + player.overall * 1.15 + player.fitness * 0.14 + player.morale * 0.08 + fitBonus;
    }, 0);
    if (!best || fitScore > best.score) {
      best = { score: fitScore, formation, starters, bench: picked.bench };
    }
  });

  const starters = best.starters;
  const attack = starters.reduce((sum, player) => sum + player.attack, 0) / starters.length;
  const defense = starters.reduce((sum, player) => sum + player.defense, 0) / starters.length;
  const passing = starters.reduce((sum, player) => sum + player.passing, 0) / starters.length;
  const stamina = starters.reduce((sum, player) => sum + player.stamina, 0) / starters.length;

  const mentality =
    attack > defense + 9 ? "attacking" :
    defense > attack + 8 ? "defensive" :
    passing > attack + 5 ? "positive" :
    "balanced";

  const style =
    passing > attack + 7 ? "tikiTaka" :
    stamina > 78 && defense > 63 ? "pressing" :
    attack > passing + 5 ? "direct" :
    "possession";

  return {
    formation: best.formation,
    mentality,
    style,
    starters: best.starters,
    bench: best.bench,
    reserves: players.filter((player) => !new Set([...best.starters, ...best.bench].map((entry) => entry.id)).has(player.id)),
  };
}

function pairKnockoutEntrants(clubs) {
  const seeds = [...clubs].sort((a, b) => b.reputation - a.reputation || b.strength - a.strength || a.name.localeCompare(b.name));
  const pairs = [];
  while (seeds.length >= 2) {
    pairs.push([seeds.shift(), seeds.pop()]);
  }
  return pairs;
}

function insertKnockoutRound(fixturesToInsert) {
  const insertFixture = db.prepare(`
    INSERT INTO fixtures (
      league_id, round_no, home_club_id, away_club_id, status,
      match_date, competition_type, competition_name, competition_stage,
      weather_json, referee, attendance_estimate, winner_club_id, result_note
    )
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
  `);

  fixturesToInsert.forEach((entry) => {
    const league = db.prepare("SELECT * FROM leagues WHERE id = ?").get(entry.homeClub.league_id);
    const meta = buildFixtureMeta(league, entry.roundNo, entry.homeClub, entry.awayClub, {
      competitionType: entry.competitionType,
      competitionName: entry.competitionName,
      competitionStage: entry.competitionStage,
    });

    insertFixture.run(
      entry.homeClub.league_id,
      entry.roundNo,
      entry.homeClub.id,
      entry.awayClub.id,
      meta.matchDate,
      meta.competitionType,
      meta.competitionName,
      meta.competitionStage,
      JSON.stringify(meta.weather),
      meta.referee,
      meta.attendanceEstimate
    );
  });
}

function seedKnockoutCompetitions(selectedClubId, maxLeagueRound) {
  const allClubs = db.prepare("SELECT * FROM clubs ORDER BY reputation DESC, strength DESC, name").all();
  const byCountry = groupByCountry(allClubs);
  const managerClub = db.prepare("SELECT * FROM clubs WHERE id = ?").get(selectedClubId);
  const domesticRound = maxLeagueRound + 1;
  const europeRound = maxLeagueRound + 2;

  const domesticFixtures = [];
  byCountry.forEach((clubs, country) => {
    let entrants = clubs.slice(0, 16);
    if (managerClub.country === country && !entrants.some((club) => club.id === managerClub.id)) {
      entrants = [...entrants.slice(0, 15), managerClub];
    }
    if (entrants.length >= 2) {
      pairKnockoutEntrants(entrants).forEach(([homeClub, awayClub]) => {
        domesticFixtures.push({
          roundNo: domesticRound,
          competitionType: "cup",
          competitionName: countryCupName(country),
          competitionStage: KNOCKOUT_STAGE_SEQUENCE[0],
          homeClub,
          awayClub,
        });
      });
    }
  });
  insertKnockoutRound(domesticFixtures);

  const topTierClubs = db.prepare(`
    SELECT c.*, l.country, l.name AS league_name
    FROM clubs c
    JOIN leagues l ON l.id = c.league_id
    WHERE l.tier = 1
    ORDER BY c.reputation DESC, c.strength DESC, c.name
  `).all();
  const topTierByCountry = groupByCountry(topTierClubs);

  const championsEntrants = [];
  topTierByCountry.forEach((clubs) => {
    championsEntrants.push(...clubs.slice(0, 2));
  });
  while (championsEntrants.length < 16) {
    const fallback = topTierClubs.find((club) => !championsEntrants.some((entry) => entry.id === club.id));
    if (!fallback) {
      break;
    }
    championsEntrants.push(fallback);
  }

  const uefaEntrants = topTierClubs.filter((club) => !championsEntrants.some((entry) => entry.id === club.id)).slice(0, 16);
  const europeFixtures = [];
  pairKnockoutEntrants(championsEntrants.slice(0, 16)).forEach(([homeClub, awayClub]) => {
    europeFixtures.push({
      roundNo: europeRound,
      competitionType: "champions",
      competitionName: competitionDisplayName("champions"),
      competitionStage: KNOCKOUT_STAGE_SEQUENCE[0],
      homeClub,
      awayClub,
    });
  });
  pairKnockoutEntrants(uefaEntrants).forEach(([homeClub, awayClub]) => {
    europeFixtures.push({
      roundNo: europeRound,
      competitionType: "uefa",
      competitionName: competitionDisplayName("uefa"),
      competitionStage: KNOCKOUT_STAGE_SEQUENCE[0],
      homeClub,
      awayClub,
    });
  });
  insertKnockoutRound(europeFixtures);
}

function ensureRuntimeCompetitions() {
  const manager = getManager();
  if (!manager) {
    return;
  }

  const existing = db.prepare("SELECT COUNT(*) AS count FROM fixtures WHERE competition_type != 'league'").get()?.count || 0;
  if (existing > 0) {
    return;
  }

  const maxLeagueRound = db.prepare("SELECT MAX(round_no) AS maxRound FROM fixtures WHERE competition_type = 'league'").get()?.maxRound || 0;
  seedKnockoutCompetitions(manager.club_id, maxLeagueRound);
}

function initializeRuntimeFromSeed(selectedClubId, managerName) {
  clearRuntimeTables();
  db.exec(`
    INSERT INTO leagues SELECT * FROM seed_leagues;
    INSERT INTO clubs (
      id, league_id, country, tier, name, short_name, strength, reputation, stadium_capacity,
      ticket_price, balance, board_expectation, logo_primary, logo_secondary
    )
    SELECT
      id, league_id, country, tier, name, short_name, strength, reputation, stadium_capacity,
      ticket_price, balance, board_expectation, logo_primary, logo_secondary
    FROM seed_clubs;
    INSERT INTO players (
      id, club_id, name, position, secondary_positions, nationality, birth_date, hometown, age,
      overall, attack, defense, passing, stamina, goalkeeping, wage, value, morale, fitness,
      goals, assists, yellow_cards, red_cards, appearances, starts, minutes
    )
    SELECT
      id, club_id, name, position, secondary_positions, nationality, birth_date, hometown, age,
      overall, attack, defense, passing, stamina, goalkeeping, wage, value, 72, 90,
      0, 0, 0, 0, 0, 0, 0
    FROM seed_players;
  `);

  const clubIds = db.prepare("SELECT id FROM clubs ORDER BY id").all().map((row) => row.id);
  clubIds.forEach((clubId) => buildDefaultTacticForClub(clubId));

  const leagues = db.prepare("SELECT * FROM leagues ORDER BY id").all();
  const insertFixture = db.prepare(`
    INSERT INTO fixtures (
      league_id, round_no, home_club_id, away_club_id, status,
      match_date, competition_type, competition_name, competition_stage,
      weather_json, referee, attendance_estimate, winner_club_id, result_note
    )
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
  `);

  leagues.forEach((league) => {
    const clubRows = db.prepare("SELECT * FROM clubs WHERE league_id = ? ORDER BY reputation DESC, name").all(league.id);
    const clubById = new Map(clubRows.map((row) => [row.id, row]));
    const rounds = circleSchedule(clubRows.map((row) => row.id));
    rounds.forEach((round, roundIndex) => {
      round.forEach(([homeClubId, awayClubId]) => {
        const meta = buildFixtureMeta(league, roundIndex + 1, clubById.get(homeClubId), clubById.get(awayClubId));
        insertFixture.run(
          league.id,
          roundIndex + 1,
          homeClubId,
          awayClubId,
          meta.matchDate,
          meta.competitionType,
          meta.competitionName,
          meta.competitionStage,
          JSON.stringify(meta.weather),
          meta.referee,
          meta.attendanceEstimate
        );
      });
    });
  });

  const maxLeagueRound = db.prepare("SELECT MAX(round_no) AS maxRound FROM fixtures WHERE competition_type = 'league'").get()?.maxRound || 0;
  seedKnockoutCompetitions(selectedClubId, maxLeagueRound);

  const selectedClub = db.prepare("SELECT * FROM clubs WHERE id = ?").get(selectedClubId);
  db.prepare(`
    INSERT INTO manager (
      id, manager_name, club_id, cash, board_confidence, ticket_price, stadium_capacity,
      fan_mood, current_round, last_summary_json, job_status, language
    ) VALUES (1, ?, ?, ?, 72, ?, ?, 68, 1, '[]', 'active', 'ru')
  `).run(managerName || "Legacy Manager", selectedClubId, selectedClub.balance, selectedClub.ticket_price, selectedClub.stadium_capacity);

  db.prepare("INSERT INTO finance_entries (amount, category, description, round_no) VALUES (?, 'board', ?, 0)")
    .run(selectedClub.balance, localize(`Совет директоров выделяет стартовый бюджет в ${selectedClub.name}.`, `The board grants your opening budget at ${selectedClub.name}.`));

  refreshTransferMarket();
}

function getManager() {
  return db.prepare("SELECT * FROM manager WHERE id = 1").get();
}

function getManagerClub() {
  const manager = getManager();
  if (!manager) {
    return null;
  }
  return db.prepare("SELECT * FROM clubs WHERE id = ?").get(manager.club_id);
}

function readTactics(clubId) {
  return db.prepare("SELECT * FROM club_tactics WHERE club_id = ?").get(clubId);
}

function resolveLineup(clubId) {
  const tactics = readTactics(clubId);
  const players = db.prepare("SELECT * FROM players WHERE club_id = ? ORDER BY overall DESC, age ASC").all(clubId);
  const playerMap = new Map(players.map((player) => [player.id, player]));

  if (!tactics) {
    const auto = pickBestLineup(players, "4-4-2");
    return {
      formation: "4-4-2",
      mentality: "balanced",
      style: "possession",
      starters: auto.starters,
      bench: auto.bench,
      reserves: auto.reserves,
    };
  }

  const lineupIds = JSON.parse(tactics.lineup_json || "[]");
  const benchIds = JSON.parse(tactics.bench_json || "[]");
  const starters = lineupIds.map((id) => playerMap.get(id)).filter(Boolean);
  const bench = benchIds.map((id) => playerMap.get(id)).filter(Boolean);
  const usedIds = new Set([...starters, ...bench].map((player) => player.id));
  const extras = players.filter((player) => !usedIds.has(player.id));

  if (starters.length !== 11) {
    const auto = pickBestLineup(players, tactics.formation);
    db.prepare(`
      UPDATE club_tactics
      SET lineup_json = ?, bench_json = ?
      WHERE club_id = ?
    `).run(JSON.stringify(auto.starters.map((player) => player.id)), JSON.stringify(auto.bench.map((player) => player.id)), clubId);
    return {
      formation: tactics.formation,
      mentality: tactics.mentality,
      style: tactics.style,
      starters: auto.starters,
      bench: auto.bench,
      reserves: auto.reserves,
    };
  }

  return {
    formation: tactics.formation,
    mentality: tactics.mentality,
    style: tactics.style,
    starters,
    bench,
    reserves: extras,
  };
}

function resolveAiLineup(clubId) {
  const players = db.prepare("SELECT * FROM players WHERE club_id = ? ORDER BY overall DESC, age ASC").all(clubId);
  return pickAiSetup(players);
}

function getClubSnapshot(clubId) {
  const club = db.prepare("SELECT * FROM clubs WHERE id = ?").get(clubId);
  const lineup = resolveLineup(clubId);
  return {
    clubId,
    clubName: club.name,
    formation: lineup.formation,
    mentality: lineup.mentality,
    style: lineup.style,
    starters: lineup.starters,
    bench: lineup.bench,
    reserves: lineup.reserves,
  };
}

function computeLeagueTable(leagueId) {
  const clubs = db.prepare("SELECT * FROM clubs WHERE league_id = ? ORDER BY name").all(leagueId);
  const table = new Map();

  clubs.forEach((club) => {
    table.set(club.id, {
      clubId: club.id,
      clubName: club.name,
      shortName: club.short_name,
      logoPrimary: club.logo_primary,
      logoSecondary: club.logo_secondary,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      strength: club.strength,
    });
  });

  const fixtures = db.prepare("SELECT * FROM fixtures WHERE league_id = ? AND status = 'played'").all(leagueId);
  fixtures.forEach((fixture) => {
    const home = table.get(fixture.home_club_id);
    const away = table.get(fixture.away_club_id);

    home.played += 1;
    away.played += 1;
    home.goalsFor += fixture.home_score;
    home.goalsAgainst += fixture.away_score;
    away.goalsFor += fixture.away_score;
    away.goalsAgainst += fixture.home_score;

    if (fixture.home_score > fixture.away_score) {
      home.wins += 1;
      away.losses += 1;
      home.points += 3;
    } else if (fixture.home_score < fixture.away_score) {
      away.wins += 1;
      home.losses += 1;
      away.points += 3;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  return [...table.values()]
    .map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
    }))
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      b.strength - a.strength ||
      a.clubName.localeCompare(b.clubName)
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function getTopScorers(leagueId) {
  return db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.position,
        p.goals,
        p.assists,
        c.name AS clubName,
        c.logo_primary AS logoPrimary,
        c.logo_secondary AS logoSecondary
      FROM players p
      JOIN clubs c ON c.id = p.club_id
      WHERE c.league_id = ? AND (p.goals > 0 OR p.assists > 0)
      ORDER BY p.goals DESC, p.assists DESC, p.overall DESC, p.name ASC
      LIMIT 10
    `)
    .all(leagueId);
}

function getUpcomingFixtures(clubId, limit = 5) {
  return db
    .prepare(`
      SELECT
        f.id,
        f.round_no AS roundNo,
        f.status,
        f.match_date AS matchDate,
        f.competition_type AS competitionType,
        f.competition_name AS competitionName,
        f.competition_stage AS competitionStage,
        f.result_note AS resultNote,
        f.referee,
        f.weather_json AS weatherJson,
        f.attendance_estimate AS attendanceEstimate,
        home.name AS homeClubName,
        away.name AS awayClubName,
        home.id AS homeClubId,
        away.id AS awayClubId,
        l.name AS leagueName
      FROM fixtures f
      JOIN clubs home ON home.id = f.home_club_id
      JOIN clubs away ON away.id = f.away_club_id
      JOIN leagues l ON l.id = f.league_id
      WHERE (f.home_club_id = ? OR f.away_club_id = ?)
      ORDER BY f.round_no ASC, f.id ASC
      LIMIT ?
    `)
    .all(clubId, clubId, limit);
}

function getNextFixture(clubId) {
  return db
    .prepare(`
      SELECT
        f.*,
        home.name AS homeClubName,
        away.name AS awayClubName,
        home.logo_primary AS homeLogoPrimary,
        home.logo_secondary AS homeLogoSecondary,
        away.logo_primary AS awayLogoPrimary,
        away.logo_secondary AS awayLogoSecondary,
        l.name AS leagueName
      FROM fixtures f
      JOIN clubs home ON home.id = f.home_club_id
      JOIN clubs away ON away.id = f.away_club_id
      JOIN leagues l ON l.id = f.league_id
      WHERE (f.home_club_id = ? OR f.away_club_id = ?) AND f.status = 'pending'
      ORDER BY f.round_no ASC, f.id ASC
      LIMIT 1
    `)
    .get(clubId, clubId);
}

function getFullCalendar(clubId) {
  return db
    .prepare(`
      SELECT
        f.id,
        f.round_no AS roundNo,
        f.status,
        f.match_date AS matchDate,
        f.competition_type AS competitionType,
        f.competition_name AS competitionName,
        f.competition_stage AS competitionStage,
        f.result_note AS resultNote,
        f.home_score AS homeScore,
        f.away_score AS awayScore,
        home.name AS homeClubName,
        away.name AS awayClubName,
        home.id AS homeClubId,
        away.id AS awayClubId
      FROM fixtures f
      JOIN clubs home ON home.id = f.home_club_id
      JOIN clubs away ON away.id = f.away_club_id
      WHERE f.home_club_id = ? OR f.away_club_id = ?
      ORDER BY f.round_no ASC, f.id ASC
    `)
    .all(clubId, clubId);
}

function getTransferMarket(clubId) {
  return db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.position,
        p.overall,
        p.age,
        p.nationality,
        p.value,
        tm.asking_price AS askingPrice,
        seller.name AS sellerClub,
        seller.logo_primary AS logoPrimary,
        seller.logo_secondary AS logoSecondary
      FROM transfer_market tm
      JOIN players p ON p.id = tm.player_id
      JOIN clubs seller ON seller.id = tm.seller_club_id
      WHERE p.club_id != ?
      ORDER BY p.overall DESC, tm.asking_price ASC
      LIMIT 40
    `)
    .all(clubId);
}

function refreshTransferMarket() {
  const managerClub = getManagerClub();
  db.exec("DELETE FROM transfer_market");
  const candidates = db
    .prepare(`
      SELECT p.*, c.id AS sellerClubId
      FROM players p
      JOIN clubs c ON c.id = p.club_id
      WHERE c.id != ?
      ORDER BY RANDOM()
      LIMIT 80
    `)
    .all(managerClub?.id || -1);

  const insert = db.prepare(`
    INSERT INTO transfer_market (player_id, seller_club_id, asking_price)
    VALUES (?, ?, ?)
  `);

  candidates.forEach((player) => {
    const askingPrice = Math.round(player.value * (1.05 + Math.random() * 0.35));
    insert.run(player.id, player.sellerClubId, askingPrice);
  });
}

function getTransferOffers(clubId) {
  return db.prepare(`
    SELECT
      o.*,
      p.name AS playerName,
      p.position,
      p.overall,
      seller.name AS sellerClubName,
      buyer.name AS buyerClubName
    FROM transfer_offers o
    JOIN players p ON p.id = o.player_id
    JOIN clubs seller ON seller.id = o.seller_club_id
    LEFT JOIN clubs buyer ON buyer.id = o.buyer_club_id
    WHERE o.seller_club_id = ? OR o.buyer_club_id = ?
    ORDER BY o.id DESC
  `).all(clubId, clubId);
}

function evaluateOfferRatio(proposedFee, askingPrice) {
  if (!askingPrice) {
    return 0;
  }
  return proposedFee / askingPrice;
}

function submitTransferOffer(playerId, proposedFee) {
  const manager = getManager();
  const buyerClub = getManagerClub();
  const listing = db.prepare("SELECT * FROM transfer_market WHERE player_id = ?").get(playerId);
  if (!listing) {
    throw new Error("Игрок уже недоступен на рынке.");
  }

  const existing = db.prepare(`
    SELECT id
    FROM transfer_offers
    WHERE player_id = ? AND buyer_club_id = ? AND direction = 'buy' AND status IN ('pending', 'negotiating', 'accepted')
  `).get(playerId, buyerClub.id);
  if (existing) {
    throw new Error("По этому игроку уже есть активное предложение.");
  }

  const offer = Math.max(0, Math.round(Number(proposedFee) || 0));
  db.prepare(`
    INSERT INTO transfer_offers (
      direction, player_id, seller_club_id, buyer_club_id, status,
      asking_price, proposed_fee, response_fee, message, submitted_round, response_round
    ) VALUES ('buy', ?, ?, ?, 'pending', ?, ?, NULL, ?, ?, ?)
  `).run(
    playerId,
    listing.seller_club_id,
    buyerClub.id,
    listing.asking_price,
    offer,
    "Ожидается ответ клуба.",
    manager.current_round,
    manager.current_round + 1
  );
  addFinanceEntry(0, "transfer", `Отправлено предложение за игрока на ${offer.toLocaleString("en-US")} EUR.`, manager.current_round);
}

function submitSaleOffer(playerId, askingPrice) {
  const manager = getManager();
  const sellerClub = getManagerClub();
  const player = db.prepare("SELECT * FROM players WHERE id = ? AND club_id = ?").get(playerId, sellerClub.id);
  if (!player) {
    throw new Error("Игрок не принадлежит вашему клубу.");
  }

  const existing = db.prepare(`
    SELECT id
    FROM transfer_offers
    WHERE player_id = ? AND seller_club_id = ? AND direction = 'sell' AND status IN ('pending', 'negotiating', 'accepted')
  `).get(playerId, sellerClub.id);
  if (existing) {
    throw new Error("По этому игроку уже ожидается ответ рынка.");
  }

  const ask = Math.max(0, Math.round(Number(askingPrice) || player.value));
  db.prepare(`
    INSERT INTO transfer_offers (
      direction, player_id, seller_club_id, buyer_club_id, status,
      asking_price, proposed_fee, response_fee, message, submitted_round, response_round
    ) VALUES ('sell', ?, ?, 0, 'pending', ?, ?, NULL, ?, ?, ?)
  `).run(
    playerId,
    sellerClub.id,
    ask,
    ask,
    "Игрок выставлен на переговоры. Ждем отклик через тур.",
    manager.current_round,
    manager.current_round + 1
  );
  addFinanceEntry(0, "transfer", `Выставлен на продажу ${player.name} за ${ask.toLocaleString("en-US")} EUR.`, manager.current_round);
}

function completeTransferOffer(offer) {
  const manager = getManager();
  const player = db.prepare("SELECT * FROM players WHERE id = ?").get(offer.player_id);
  if (!player) {
    return;
  }

  if (offer.direction === "buy") {
    if (manager.cash < offer.response_fee) {
      throw new Error("На счете недостаточно денег, чтобы принять условия.");
    }
    db.prepare("UPDATE players SET club_id = ?, morale = 75, fitness = MAX(fitness, 82) WHERE id = ?").run(offer.buyer_club_id, offer.player_id);
    db.prepare("DELETE FROM transfer_market WHERE player_id = ?").run(offer.player_id);
    updateManagerFinancials({ cash: manager.cash - offer.response_fee });
    addFinanceEntry(-offer.response_fee, "transfer", `Подписан ${player.name} за ${offer.response_fee.toLocaleString("en-US")} EUR.`, manager.current_round);
  } else {
    const buyer = offer.buyer_club_id ? db.prepare("SELECT name FROM clubs WHERE id = ?").get(offer.buyer_club_id) : { name: "другой клуб" };
    db.prepare("UPDATE players SET club_id = ?, morale = 68 WHERE id = ?").run(offer.buyer_club_id, offer.player_id);
    updateManagerFinancials({ cash: manager.cash + offer.response_fee });
    addFinanceEntry(offer.response_fee, "transfer", `Продан ${player.name} в ${buyer.name} за ${offer.response_fee.toLocaleString("en-US")} EUR.`, manager.current_round);
  }

  db.prepare("UPDATE transfer_offers SET status = 'completed', message = ? WHERE id = ?")
    .run("Сделка завершена.", offer.id);
}

function respondToTransferOffer(offerId, action, counterFee) {
  const manager = getManager();
  const offer = db.prepare("SELECT * FROM transfer_offers WHERE id = ?").get(offerId);
  if (!offer) {
    throw new Error("Предложение не найдено.");
  }

  if (action === "withdraw") {
    db.prepare("UPDATE transfer_offers SET status = 'withdrawn', message = ? WHERE id = ?")
      .run("Переговоры прекращены.", offer.id);
    return;
  }

  if (action === "accept" && ["accepted", "negotiating"].includes(offer.status)) {
    const updatedOffer = {
      ...offer,
      response_fee: offer.response_fee || offer.proposed_fee,
    };
    completeTransferOffer(updatedOffer);
    return;
  }

  if (action === "counter" && ["negotiating", "accepted"].includes(offer.status)) {
    const fee = Math.max(0, Math.round(Number(counterFee) || 0));
    db.prepare(`
      UPDATE transfer_offers
      SET status = 'pending', proposed_fee = ?, message = ?, submitted_round = ?, response_round = ?
      WHERE id = ?
    `).run(
      fee,
      "Отправлено встречное предложение. Снова ждем ответа через тур.",
      manager.current_round,
      manager.current_round + 1,
      offer.id
    );
    return;
  }

  throw new Error("Это действие сейчас недоступно.");
}

function resolveTransferOffersForRound(roundNo) {
  const pendingOffers = db.prepare(`
    SELECT *
    FROM transfer_offers
    WHERE status = 'pending' AND response_round <= ?
    ORDER BY id ASC
  `).all(roundNo);

  pendingOffers.forEach((offer) => {
    const player = db.prepare("SELECT * FROM players WHERE id = ?").get(offer.player_id);
    if (!player) {
      db.prepare("UPDATE transfer_offers SET status = 'rejected', message = ? WHERE id = ?")
        .run("Игрок уже недоступен.", offer.id);
      return;
    }

    if (offer.direction === "buy") {
      const ratio = evaluateOfferRatio(offer.proposed_fee, offer.asking_price);
      if (ratio < 0.55) {
        db.prepare("UPDATE transfer_offers SET status = 'rejected', message = ? WHERE id = ?")
          .run("Клуб возмущен таким предложением и сразу отказал.", offer.id);
        return;
      }
      if (ratio < 0.78) {
        db.prepare("UPDATE transfer_offers SET status = 'rejected', message = ? WHERE id = ?")
          .run("Предложение признано слишком низким. Без шансов.", offer.id);
        return;
      }
      if (ratio < 0.93) {
        const counter = Math.round((offer.asking_price + offer.proposed_fee) / 2);
        db.prepare(`
          UPDATE transfer_offers
          SET status = 'negotiating', response_fee = ?, message = ?
          WHERE id = ?
        `).run(counter, `Клуб готов торговаться. Они хотят ${counter.toLocaleString("en-US")} EUR.`, offer.id);
        return;
      }
      db.prepare(`
        UPDATE transfer_offers
        SET status = 'accepted', response_fee = ?, message = ?
        WHERE id = ?
      `).run(offer.proposed_fee, "Клуб принял условия. Можно завершать сделку.", offer.id);
      return;
    }

    const ratio = evaluateOfferRatio(offer.asking_price, player.value);
    const buyerClub = db.prepare(`
      SELECT id, name
      FROM clubs
      WHERE id != ? AND balance >= ? * 0.45
      ORDER BY ABS(strength - ?) ASC, RANDOM()
      LIMIT 1
    `).get(offer.seller_club_id, offer.asking_price, player.overall);

    if (!buyerClub || ratio > 1.45) {
      db.prepare("UPDATE transfer_offers SET status = 'rejected', message = ? WHERE id = ?")
        .run("На таких условиях покупателей не нашлось.", offer.id);
      return;
    }
    if (ratio > 1.1) {
      const counter = Math.round(Math.max(player.value * 0.92, offer.asking_price * 0.88));
      db.prepare(`
        UPDATE transfer_offers
        SET status = 'negotiating', buyer_club_id = ?, response_fee = ?, message = ?
        WHERE id = ?
      `).run(buyerClub.id, counter, `${buyerClub.name} предлагает ${counter.toLocaleString("en-US")} EUR.`, offer.id);
      return;
    }
    db.prepare(`
      UPDATE transfer_offers
      SET status = 'accepted', buyer_club_id = ?, response_fee = ?, message = ?
      WHERE id = ?
    `).run(buyerClub.id, offer.asking_price, `${buyerClub.name} согласен на ваши условия.`, offer.id);
  });
}

function getSaveSnapshot() {
  return {
    leagues: db.prepare("SELECT * FROM leagues ORDER BY id").all(),
    clubs: db.prepare("SELECT * FROM clubs ORDER BY id").all(),
    players: db.prepare("SELECT * FROM players ORDER BY id").all(),
    clubTactics: db.prepare("SELECT * FROM club_tactics ORDER BY club_id").all(),
    fixtures: db.prepare("SELECT * FROM fixtures ORDER BY id").all(),
    manager: db.prepare("SELECT * FROM manager WHERE id = 1").get(),
    transferMarket: db.prepare("SELECT * FROM transfer_market ORDER BY player_id").all(),
    transferOffers: db.prepare("SELECT * FROM transfer_offers ORDER BY id").all(),
    financeEntries: db.prepare("SELECT * FROM finance_entries ORDER BY id").all(),
    liveMatch: db.prepare("SELECT * FROM live_match WHERE id = 1").get() || null,
  };
}

function getSaveSlots() {
  return db.prepare(`
    SELECT id, name, created_at AS createdAt
    FROM save_slots
    ORDER BY id DESC
  `).all();
}

function saveGame(name) {
  const snapshot = getSaveSnapshot();
  if (!snapshot.manager) {
    throw new Error("Нет активной карьеры для сохранения.");
  }
  db.prepare(`
    INSERT INTO save_slots (name, snapshot_json)
    VALUES (?, ?)
  `).run(name || localize(`Сохранение - тур ${snapshot.manager.current_round}`, `Save Round ${snapshot.manager.current_round}`), JSON.stringify(snapshot));
}

function restoreRuntimeSnapshot(snapshot) {
  clearRuntimeTables();

  const insertLeague = db.prepare(`
    INSERT INTO leagues (id, country, name, tier, season, slug)
    VALUES (@id, @country, @name, @tier, @season, @slug)
  `);
  const insertClub = db.prepare(`
    INSERT INTO clubs (
      id, league_id, country, tier, name, short_name, strength, reputation, stadium_capacity,
      ticket_price, balance, board_expectation, logo_primary, logo_secondary
    ) VALUES (
      @id, @league_id, @country, @tier, @name, @short_name, @strength, @reputation, @stadium_capacity,
      @ticket_price, @balance, @board_expectation, @logo_primary, @logo_secondary
    )
  `);
  const insertPlayer = db.prepare(`
    INSERT INTO players (
      id, club_id, name, position, secondary_positions, nationality, birth_date, hometown, age,
      overall, attack, defense, passing, stamina, goalkeeping, wage, value, morale, fitness,
      goals, assists, yellow_cards, red_cards, appearances, starts, minutes
    ) VALUES (
      @id, @club_id, @name, @position, @secondary_positions, @nationality, @birth_date, @hometown, @age,
      @overall, @attack, @defense, @passing, @stamina, @goalkeeping, @wage, @value, @morale, @fitness,
      @goals, @assists, @yellow_cards, @red_cards, @appearances, @starts, @minutes
    )
  `);
  const insertClubTactics = db.prepare(`
    INSERT INTO club_tactics (club_id, formation, mentality, style, lineup_json, bench_json)
    VALUES (@club_id, @formation, @mentality, @style, @lineup_json, @bench_json)
  `);
  const insertFixture = db.prepare(`
    INSERT INTO fixtures (
      id, league_id, round_no, home_club_id, away_club_id, status, home_score, away_score,
      stats_json, events_json, match_date, competition_type, competition_name, competition_stage,
      weather_json, referee, attendance_estimate, winner_club_id, result_note
    ) VALUES (
      @id, @league_id, @round_no, @home_club_id, @away_club_id, @status, @home_score, @away_score,
      @stats_json, @events_json, @match_date, @competition_type, @competition_name, @competition_stage,
      @weather_json, @referee, @attendance_estimate, @winner_club_id, @result_note
    )
  `);

  const transaction = db.transaction(() => {
    snapshot.leagues.forEach((row) => insertLeague.run(row));
    snapshot.clubs.forEach((row) => insertClub.run(row));
    snapshot.players.forEach((row) => insertPlayer.run(row));
    snapshot.clubTactics.forEach((row) => insertClubTactics.run(row));
    snapshot.fixtures.forEach((row) => insertFixture.run(row));

    if (snapshot.manager) {
      db.prepare(`
        INSERT INTO manager (
          id, manager_name, club_id, cash, board_confidence, ticket_price, stadium_capacity,
          fan_mood, current_round, last_summary_json, job_status, language
        ) VALUES (
          @id, @manager_name, @club_id, @cash, @board_confidence, @ticket_price, @stadium_capacity,
          @fan_mood, @current_round, @last_summary_json, @job_status, @language
        )
      `).run(snapshot.manager);
    }

    snapshot.transferMarket.forEach((row) => {
      db.prepare("INSERT INTO transfer_market (player_id, seller_club_id, asking_price) VALUES (?, ?, ?)")
        .run(row.player_id, row.seller_club_id, row.asking_price);
    });
    snapshot.transferOffers.forEach((row) => {
      db.prepare(`
        INSERT INTO transfer_offers (
          id, direction, player_id, seller_club_id, buyer_club_id, status,
          asking_price, proposed_fee, response_fee, message, submitted_round, response_round
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        row.id,
        row.direction,
        row.player_id,
        row.seller_club_id,
        row.buyer_club_id,
        row.status,
        row.asking_price,
        row.proposed_fee,
        row.response_fee,
        row.message,
        row.submitted_round,
        row.response_round
      );
    });
    snapshot.financeEntries.forEach((row) => {
      db.prepare(`
        INSERT INTO finance_entries (id, amount, category, description, round_no, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(row.id, row.amount, row.category, row.description, row.round_no, row.created_at);
    });
    if (snapshot.liveMatch) {
      db.prepare("INSERT INTO live_match (id, fixture_id, state_json, is_active) VALUES (?, ?, ?, ?)")
        .run(snapshot.liveMatch.id, snapshot.liveMatch.fixture_id, snapshot.liveMatch.state_json, snapshot.liveMatch.is_active);
    }
  });

  transaction();
}

function loadGame(saveId) {
  const row = db.prepare("SELECT snapshot_json FROM save_slots WHERE id = ?").get(saveId);
  if (!row) {
    throw new Error("Сохранение не найдено.");
  }
  restoreRuntimeSnapshot(JSON.parse(row.snapshot_json));
}

function exitToMenu() {
  clearRuntimeTables();
}

function getWageBill(clubId) {
  return db.prepare("SELECT COALESCE(SUM(wage), 0) AS wages FROM players WHERE club_id = ?").get(clubId).wages;
}

function getRecentFinanceEntries() {
  return db.prepare(`
    SELECT amount, category, description, round_no AS roundNo, created_at AS createdAt
    FROM finance_entries
    ORDER BY id DESC
    LIMIT 8
  `).all();
}

function buildBoardMessage(manager, club, table) {
  const rank = table.find((entry) => entry.clubId === club.id)?.rank || table.length;
  const projectedRank = [...table].sort((a, b) => b.strength - a.strength).findIndex((entry) => entry.clubId === club.id) + 1;

  if (manager.job_status !== "active") {
    return localize("Совет директоров уже уволил тебя. Начни новую карьеру, чтобы продолжить.", "The board has dismissed you. Start a new legacy to continue.");
  }
  if (manager.board_confidence >= 80) {
    return localize(`Совет директоров в восторге от курса ${club.name}. Не сбавляй темп.`, `The board loves the direction at ${club.name}. Keep the momentum.`);
  }
  if (manager.board_confidence >= 60) {
    return localize(`Результаты пока устраивают, но совет ждет ${club.board_expectation.toLowerCase()}.`, `Results are acceptable, but the board still expects ${club.board_expectation.toLowerCase()}.`);
  }
  if (manager.board_confidence >= 35) {
    return localize(`Давление растет. Сейчас ты на ${rank}-м месте, ожидания совета около ${projectedRank}-го.`, `Pressure is rising. Current rank ${rank}, board projection around ${projectedRank}.`);
  }
  return localize(`Ты на грани. Еще одна плохая серия может стоить работы в ${club.name}.`, `You are on the edge. Another poor run could end your job at ${club.name}.`);
}

function getCompetitionOverview() {
  const competitions = db.prepare(`
    SELECT
      competition_name AS competitionName,
      competition_type AS competitionType
    FROM fixtures
    WHERE competition_type != 'league'
    GROUP BY competition_name, competition_type
    ORDER BY
      CASE competition_type
        WHEN 'champions' THEN 1
        WHEN 'uefa' THEN 2
        ELSE 3
      END,
      competition_name
  `).all();

  const cards = competitions.map((competition) => {
    const fixtures = db.prepare(`
      SELECT
        f.id,
        f.round_no AS roundNo,
        f.status,
        f.competition_stage AS competitionStage,
        f.home_score AS homeScore,
        f.away_score AS awayScore,
        f.result_note AS resultNote,
        f.match_date AS matchDate,
        home.name AS homeClubName,
        away.name AS awayClubName
      FROM fixtures f
      JOIN clubs home ON home.id = f.home_club_id
      JOIN clubs away ON away.id = f.away_club_id
      WHERE f.competition_name = ? AND f.competition_type = ?
      ORDER BY f.round_no ASC, f.id ASC
    `).all(competition.competitionName, competition.competitionType);

    const upcoming = fixtures.filter((fixture) => fixture.status === "pending");
    const played = fixtures.filter((fixture) => fixture.status === "played");
    const stage = upcoming[0]?.competitionStage || played[played.length - 1]?.competitionStage || null;

    return {
      name: competition.competitionName,
      type: competition.competitionType,
      currentStage: stage,
      remainingFixtures: upcoming.length,
      nextFixtures: upcoming.slice(0, 4),
      recentResults: played.slice(-4).reverse(),
      totalFixtures: fixtures.length,
    };
  });

  return {
    europe: cards.filter((card) => ["champions", "uefa"].includes(card.type)),
    domesticCups: cards.filter((card) => card.type === "cup"),
  };
}

function buildState() {
  const manager = getManager();
  if (!manager) {
    return {
      setupRequired: true,
      season: SEASON_LABEL,
      clubs: getSeedClubList(),
      saveSlots: getSaveSlots(),
      defaultLanguage: "ru",
    };
  }

  const club = getManagerClub();
  ensureRuntimeCompetitions();
  const league = db.prepare("SELECT * FROM leagues WHERE id = ?").get(club.league_id);
  const table = computeLeagueTable(club.league_id);
  const userRank = table.find((entry) => entry.clubId === club.id)?.rank || table.length;
  const lineup = resolveLineup(club.id);
  const liveMatchRow = db.prepare("SELECT * FROM live_match WHERE id = 1 AND is_active = 1").get();
  const nextFixture = getNextFixture(club.id);
  const nextFixtureExpanded = nextFixture
    ? {
        ...nextFixture,
        competitionName: nextFixture.competition_name || nextFixture.competitionName,
        competitionType: nextFixture.competition_type || nextFixture.competitionType,
        competitionStage: nextFixture.competition_stage || nextFixture.competitionStage,
        matchDate: nextFixture.match_date || nextFixture.matchDate,
        weather: nextFixture.weather_json ? JSON.parse(nextFixture.weather_json) : null,
        resultNote: nextFixture.result_note || nextFixture.resultNote || null,
        homeLineup: buildMatchTeam(nextFixture.home_club_id, { humanControlled: nextFixture.home_club_id === club.id }).starters.map((player) => ({
          id: player.id,
          name: player.name,
          position: player.position,
          overall: player.overall,
        })),
        awayLineup: buildMatchTeam(nextFixture.away_club_id, { humanControlled: nextFixture.away_club_id === club.id }).starters.map((player) => ({
          id: player.id,
          name: player.name,
          position: player.position,
          overall: player.overall,
        })),
      }
    : null;

  return {
    setupRequired: false,
    season: SEASON_LABEL,
    manager: {
      name: manager.manager_name,
      cash: manager.cash,
      boardConfidence: manager.board_confidence,
      ticketPrice: manager.ticket_price,
      stadiumCapacity: manager.stadium_capacity,
      fanMood: manager.fan_mood,
      currentRound: manager.current_round,
      jobStatus: manager.job_status,
      language: manager.language || "ru",
    },
    club: {
      id: club.id,
      name: club.name,
      shortName: club.short_name,
      country: club.country,
      leagueName: league.name,
      tier: league.tier,
      strength: club.strength,
      balance: club.balance,
      boardExpectation: club.board_expectation,
      logoPrimary: club.logo_primary,
      logoSecondary: club.logo_secondary,
      rank: userRank,
    },
    tactics: {
      formation: lineup.formation,
      mentality: lineup.mentality,
      style: lineup.style,
      formations: Object.keys(FORMATIONS),
      mentalities: Object.keys(MENTALITY_MODIFIERS),
      styles: Object.keys(STYLE_MODIFIERS),
      starters: lineup.starters,
      bench: lineup.bench,
      reserves: lineup.reserves,
    },
    nextFixture: nextFixtureExpanded,
    fixtures: getUpcomingFixtures(club.id),
    calendar: getFullCalendar(club.id),
    leagueTable: table,
    topScorers: getTopScorers(club.league_id),
    transferMarket: getTransferMarket(club.id),
    transferOffers: getTransferOffers(club.id),
    finance: {
      wageBill: getWageBill(club.id),
      stadiumCapacity: manager.stadium_capacity,
      nextUpgradeCost: Math.round(1400000 + manager.stadium_capacity * 55),
      recentEntries: getRecentFinanceEntries(),
      camps: [
        { id: "madrid", name: localize("Сбор в Мадриде", "Madrid Camp"), cost: 650000, effect: localize("+мораль, +физика, шанс на рост навыков", "+morale, +fitness, chance for skill growth") },
        { id: "lisbon", name: localize("Сбор в Лиссабоне", "Lisbon Camp"), cost: 420000, effect: localize("+мораль, +физика, техничность", "+morale, +fitness, technical polish") },
        { id: "dubai", name: localize("Сбор в Дубае", "Dubai Camp"), cost: 980000, effect: localize("+мораль, +физика, большой прирост скиллов", "+morale, +fitness, bigger skill spike") },
      ],
    },
    board: {
      message: buildBoardMessage(manager, club, table),
      confidence: manager.board_confidence,
    },
    liveMatch: liveMatchRow ? JSON.parse(liveMatchRow.state_json) : null,
    roundSummary: JSON.parse(manager.last_summary_json || "[]"),
    competitionOverview: getCompetitionOverview(),
    saveSlots: getSaveSlots(),
  };
}

function updateTactics(payload) {
  const managerClub = getManagerClub();
  const players = db.prepare("SELECT * FROM players WHERE club_id = ? ORDER BY overall DESC, age ASC").all(managerClub.id);
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const requestedFormation = FORMATIONS[payload.formation] ? payload.formation : "4-4-2";

  let starters = Array.isArray(payload.starters)
    ? payload.starters.map((id) => playerMap.get(Number(id))).filter(Boolean)
    : [];

  starters = starters.filter((player, index, array) => array.findIndex((candidate) => candidate.id === player.id) === index);

  if (starters.length !== 11) {
    starters = pickBestLineup(players, requestedFormation).starters;
  }

  const starterIds = new Set(starters.map((player) => player.id));
  const remaining = players.filter((player) => !starterIds.has(player.id));
  const bench = (Array.isArray(payload.bench)
    ? payload.bench.map((id) => playerMap.get(Number(id))).filter(Boolean)
    : remaining)
    .filter((player, index, array) => !starterIds.has(player.id) && array.findIndex((candidate) => candidate.id === player.id) === index)
    .slice(0, 7);

  db.prepare(`
    UPDATE club_tactics
    SET formation = ?, mentality = ?, style = ?, lineup_json = ?, bench_json = ?
    WHERE club_id = ?
  `).run(
    requestedFormation,
    payload.mentality || "balanced",
    payload.style || "possession",
    JSON.stringify(starters.map((player) => player.id)),
    JSON.stringify(bench.map((player) => player.id)),
    managerClub.id
  );
}

function addFinanceEntry(amount, category, description, roundNo) {
  db.prepare(`
    INSERT INTO finance_entries (amount, category, description, round_no)
    VALUES (?, ?, ?, ?)
  `).run(amount, category, description, roundNo);
}

function updateManagerFinancials(updates) {
  const manager = getManager();
  db.prepare(`
    UPDATE manager
    SET cash = ?, board_confidence = ?, ticket_price = ?, stadium_capacity = ?, fan_mood = ?, current_round = ?, last_summary_json = ?, job_status = ?, language = ?
    WHERE id = 1
  `).run(
    updates.cash ?? manager.cash,
    updates.boardConfidence ?? manager.board_confidence,
    updates.ticketPrice ?? manager.ticket_price,
    updates.stadiumCapacity ?? manager.stadium_capacity,
    updates.fanMood ?? manager.fan_mood,
    updates.currentRound ?? manager.current_round,
    updates.lastSummaryJson ?? manager.last_summary_json,
    updates.jobStatus ?? manager.job_status,
    updates.language ?? manager.language ?? "ru"
  );
}

function setLanguage(language) {
  const manager = getManager();
  if (!manager) {
    return;
  }
  updateManagerFinancials({ language: language === "en" ? "en" : "ru" });
}

function updateTicketPrice(ticketPrice) {
  const manager = getManager();
  const price = clamp(Number(ticketPrice) || manager.ticket_price, 6, 60);
  updateManagerFinancials({ ticketPrice: price });
  addFinanceEntry(0, "ticketing", localize(`Цена билета изменена на ${price} EUR.`, `Ticket price set to EUR ${price}.`), manager.current_round);
}

function upgradeStadium() {
  const manager = getManager();
  const expansion = 2500;
  const cost = Math.round(1400000 + manager.stadium_capacity * 55);
  if (manager.cash < cost) {
    throw new Error(localize("Не хватает денег на расширение стадиона.", "Not enough cash for a stadium expansion."));
  }

  updateManagerFinancials({
    cash: manager.cash - cost,
    stadiumCapacity: manager.stadium_capacity + expansion,
  });
  addFinanceEntry(-cost, "stadium", localize(`Стадион расширен на ${expansion.toLocaleString("ru-RU")} мест.`, `Expanded the stadium by ${expansion} seats.`), manager.current_round);
}

function sendTrainingCamp(campId) {
  const options = {
    madrid: { cost: 650000, morale: 6, fitness: 4, label: localize("Сбор в Мадриде", "Madrid Camp"), baseSkill: 0.2 },
    lisbon: { cost: 420000, morale: 4, fitness: 6, label: localize("Сбор в Лиссабоне", "Lisbon Camp"), baseSkill: 0.15 },
    dubai: { cost: 980000, morale: 8, fitness: 5, label: localize("Сбор в Дубае", "Dubai Camp"), baseSkill: 0.28 },
  };

  const camp = options[campId];
  if (!camp) {
    throw new Error(localize("Неизвестный тренировочный сбор.", "Unknown training camp."));
  }

  const manager = getManager();
  const club = getManagerClub();
  if (manager.cash < camp.cost) {
    throw new Error(localize("Не хватает денег на этот сбор.", "Not enough cash for this training camp."));
  }

  db.prepare(`
    UPDATE players
    SET morale = MIN(95, morale + ?), fitness = MIN(97, fitness + ?)
    WHERE club_id = ?
  `).run(camp.morale, camp.fitness, club.id);

  const squad = db.prepare("SELECT id, position, attack, defense, passing, stamina, goalkeeping FROM players WHERE club_id = ?").all(club.id);
  const chosen = [...squad].sort(() => Math.random() - 0.5).slice(0, Math.min(10, squad.length));
  const updatePlayer = db.prepare(`
    UPDATE players
    SET overall = ?,
        attack = ?,
        defense = ?,
        passing = ?,
        stamina = ?,
        goalkeeping = ?
    WHERE id = ?
  `);

  chosen.forEach((player, index) => {
    const gain = camp.baseSkill + (index < 2 ? 0.25 : index < 5 ? 0.15 : 0.05);
    const attack = player.attack + (player.position === "F" ? gain : gain * 0.4);
    const defense = player.defense + (player.position === "D" ? gain : gain * 0.35);
    const passing = player.passing + (player.position === "M" ? gain : gain * 0.45);
    const stamina = player.stamina + gain * 0.75;
    const goalkeeping = player.goalkeeping + (player.position === "G" ? gain : 0);
    const overall =
      player.position === "G"
        ? goalkeeping * 0.55 + defense * 0.15 + passing * 0.1 + stamina * 0.05 + 25
        : attack * 0.24 + defense * 0.24 + passing * 0.22 + stamina * 0.14 + 22;

    updatePlayer.run(
      Math.round(clamp(overall, 46, 94)),
      Math.round(clamp(attack, 12, 95)),
      Math.round(clamp(defense, 12, 95)),
      Math.round(clamp(passing, 12, 95)),
      Math.round(clamp(stamina, 20, 95)),
      Math.round(clamp(goalkeeping, 10, 96)),
      player.id
    );
  });

  updateManagerFinancials({
    cash: manager.cash - camp.cost,
    fanMood: clamp(manager.fan_mood + 2, 35, 95),
  });
  addFinanceEntry(-camp.cost, "training", localize(`${camp.label}: команда улучшила мораль, физику и несколько атрибутов игроков.`, `Squad flew out for the ${camp.label}; several players improved their attributes.`), manager.current_round);
}

function buyPlayer(playerId, proposedFee) {
  submitTransferOffer(playerId, proposedFee);
}

function sellPlayer(playerId, askingPrice) {
  submitSaleOffer(playerId, askingPrice);
}

function buildMatchTeam(clubId, options = {}) {
  const club = db.prepare("SELECT * FROM clubs WHERE id = ?").get(clubId);
  const lineup = options.humanControlled ? resolveLineup(clubId) : resolveAiLineup(clubId);
  return {
    clubId,
    clubName: club.name,
    formation: lineup.formation,
    mentality: lineup.mentality,
    style: lineup.style,
    starters: lineup.starters,
    bench: lineup.bench,
    humanControlled: Boolean(options.humanControlled),
  };
}

function getFixtureById(fixtureId) {
  return db.prepare("SELECT * FROM fixtures WHERE id = ?").get(fixtureId);
}

function estimateLiveAttendance(fixture, homeClub, awayClub, managerClubId, table) {
  const homeRow = table.find((row) => row.clubId === homeClub.id);
  const awayRow = table.find((row) => row.clubId === awayClub.id);
  const titlePull = clamp((homeClub.reputation + awayClub.reputation) / 220, 0.7, 1.25);
  const rankingPull = clamp(1.05 - ((homeRow?.rank || 10) - 1) * 0.02, 0.72, 1.08);
  const rivalryBoost = Math.abs(homeClub.reputation - awayClub.reputation) < 6 ? 1.04 : 1;
  const competitionBoost = ["champions", "uefa"].includes(fixture.competition_type) ? 1.18 : fixture.competition_type === "cup" ? 1.08 : 1;
  const managerBoost = managerClubId === homeClub.id ? 1.06 : 1;
  return Math.round(homeClub.stadium_capacity * clamp(0.46 * titlePull * rankingPull * rivalryBoost * competitionBoost * managerBoost, 0.35, 0.99));
}

function resolveKnockoutWinner(fixture, state) {
  if (fixture.competition_type === "league") {
    return {
      winnerClubId:
        state.score.home > state.score.away ? fixture.home_club_id :
        state.score.home < state.score.away ? fixture.away_club_id :
        null,
      resultNote: null,
    };
  }

  if (state.score.home !== state.score.away) {
    return {
      winnerClubId: state.score.home > state.score.away ? fixture.home_club_id : fixture.away_club_id,
      resultNote: null,
    };
  }

  const home = buildMatchTeam(fixture.home_club_id);
  const away = buildMatchTeam(fixture.away_club_id);
  const homeStrength = home.starters.reduce((sum, player) => sum + player.overall + player.goalkeeping * 0.35, 0);
  const awayStrength = away.starters.reduce((sum, player) => sum + player.overall + player.goalkeeping * 0.35, 0);
  const winnerClubId = Math.random() < homeStrength / (homeStrength + awayStrength) ? fixture.home_club_id : fixture.away_club_id;
  return {
    winnerClubId,
    resultNote: winnerClubId === fixture.home_club_id
      ? localize("Победа хозяев по пенальти.", "Home side win on penalties.")
      : localize("Победа гостей по пенальти.", "Away side win on penalties."),
  };
}

function applyMatchOutcome(fixture, state) {
  const knockout = resolveKnockoutWinner(fixture, state);
  state.winnerClubId = knockout.winnerClubId;
  state.resultNote = knockout.resultNote;

  db.prepare(`
    UPDATE fixtures
    SET status = 'played', home_score = ?, away_score = ?, stats_json = ?, events_json = ?, winner_club_id = ?, result_note = ?
    WHERE id = ?
  `).run(
    state.score.home,
    state.score.away,
    JSON.stringify(state.stats),
    JSON.stringify(state.events),
    knockout.winnerClubId,
    knockout.resultNote,
    fixture.id
  );

  const playerEvents = {};
  for (const event of state.events) {
    if (!playerEvents[event.playerId]) {
      playerEvents[event.playerId] = { goals: 0, assists: 0, yellow: 0, red: 0 };
    }
    if (event.type === "goal") {
      playerEvents[event.playerId].goals += 1;
      if (event.assistId) {
        if (!playerEvents[event.assistId]) {
          playerEvents[event.assistId] = { goals: 0, assists: 0, yellow: 0, red: 0 };
        }
        playerEvents[event.assistId].assists += 1;
      }
    }
    if (event.type === "yellow") {
      playerEvents[event.playerId].yellow += 1;
    }
    if (event.type === "red") {
      playerEvents[event.playerId].red += 1;
    }
  }

  const updateStarter = db.prepare(`
    UPDATE players
    SET goals = goals + ?,
        assists = assists + ?,
        yellow_cards = yellow_cards + ?,
        red_cards = red_cards + ?,
        appearances = appearances + 1,
        starts = starts + 1,
        minutes = minutes + ?,
        morale = ?,
        fitness = ?
    WHERE id = ?
  `);

  const updateBenchPlayer = db.prepare(`
    UPDATE players
    SET appearances = appearances + 1,
        minutes = minutes + ?,
        morale = ?,
        fitness = ?
    WHERE id = ?
  `);

  for (const side of ["home", "away"]) {
    const team = state[side];
    const clubId = side === "home" ? fixture.home_club_id : fixture.away_club_id;
    const sideWon =
      knockout.winnerClubId
        ? knockout.winnerClubId === clubId
        : state.score[side] > state.score[side === "home" ? "away" : "home"];
    const sideLost =
      knockout.winnerClubId
        ? knockout.winnerClubId !== clubId
        : state.score[side] < state.score[side === "home" ? "away" : "home"];
    const moraleDelta = sideWon ? 5 : sideLost ? -4 : 1;

    team.starters.forEach((player) => {
      const events = playerEvents[player.id] || { goals: 0, assists: 0, yellow: 0, red: 0 };
      updateStarter.run(
        events.goals,
        events.assists,
        events.yellow,
        events.red,
        90,
        clamp((player.morale || 70) + moraleDelta, 45, 96),
        clamp((player.fitness || 90) - 7, 55, 95),
        player.id
      );
    });

    state.substitutions
      .filter((entry) => entry.side === side)
      .forEach((entry) => {
        updateBenchPlayer.run(
          Math.max(1, 90 - entry.minute),
          clamp(72 + moraleDelta, 48, 95),
          clamp(88 - Math.max(2, Math.round((90 - entry.minute) / 8)), 60, 95),
          entry.playerInId
        );
      });
  }
}

function simulateOtherFixturesForRound(roundNo, currentFixtureId) {
  const pendingFixtures = db.prepare(`
    SELECT * FROM fixtures
    WHERE round_no = ? AND status = 'pending' AND id != ?
    ORDER BY league_id, id
  `).all(roundNo, currentFixtureId);

  pendingFixtures.forEach((fixture) => {
    const state = simulateInstantMatch(
      fixture,
      buildMatchTeam(fixture.home_club_id),
      buildMatchTeam(fixture.away_club_id)
    );
    applyMatchOutcome(fixture, state);
  });
}

function progressKnockoutCompetitions(roundNo) {
  const completedCompetitions = db.prepare(`
    SELECT DISTINCT competition_type AS competitionType, competition_name AS competitionName
    FROM fixtures
    WHERE round_no = ? AND competition_type != 'league'
  `).all(roundNo);

  completedCompetitions.forEach((competition) => {
    const fixtures = db.prepare(`
      SELECT *
      FROM fixtures
      WHERE round_no = ? AND competition_type = ? AND competition_name = ?
      ORDER BY id
    `).all(roundNo, competition.competitionType, competition.competitionName);

    if (!fixtures.length || fixtures.some((fixture) => fixture.status !== "played")) {
      return;
    }

    const currentStage = fixtures[0].competition_stage;
    const currentIndex = KNOCKOUT_STAGE_SEQUENCE.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex >= KNOCKOUT_STAGE_SEQUENCE.length - 1) {
      return;
    }

    const nextRoundNo = roundNo + 2;
    const existingNextRound = db.prepare(`
      SELECT id
      FROM fixtures
      WHERE round_no = ? AND competition_type = ? AND competition_name = ?
      LIMIT 1
    `).get(nextRoundNo, competition.competitionType, competition.competitionName);
    if (existingNextRound) {
      return;
    }

    const winners = fixtures
      .map((fixture) => fixture.winner_club_id)
      .filter(Boolean)
      .map((clubId) => db.prepare("SELECT * FROM clubs WHERE id = ?").get(clubId));

    if (winners.length < 2) {
      return;
    }

    const fixturesToInsert = [];
    pairKnockoutEntrants(winners).forEach(([homeClub, awayClub]) => {
      fixturesToInsert.push({
        roundNo: nextRoundNo,
        competitionType: competition.competitionType,
        competitionName: competition.competitionName,
        competitionStage: KNOCKOUT_STAGE_SEQUENCE[currentIndex + 1],
        homeClub,
        awayClub,
      });
    });
    insertKnockoutRound(fixturesToInsert);
  });
}

function updateManagerAfterRound(fixture, state) {
  const manager = getManager();
  const club = getManagerClub();
  const wasHome = fixture.home_club_id === club.id;
  const scored = wasHome ? state.score.home : state.score.away;
  const conceded = wasHome ? state.score.away : state.score.home;
  const managerWon =
    state.winnerClubId
      ? state.winnerClubId === club.id
      : scored > conceded;
  const managerLost =
    state.winnerClubId
      ? state.winnerClubId !== club.id
      : scored < conceded;
  const resultDelta = managerWon ? 6 : managerLost ? -8 : 1;

  let cash = manager.cash;
  if (wasHome) {
    const attendance = clamp(
      fixture.attendance_estimate || Math.round(manager.stadium_capacity * (0.62 + manager.fan_mood / 180 - manager.ticket_price / 200)),
      Math.round(manager.stadium_capacity * 0.35),
      manager.stadium_capacity
    );
    const matchRevenue = attendance * manager.ticket_price;
    cash += matchRevenue;
    addFinanceEntry(
      matchRevenue,
      "matchday",
      localize(`Доход с домашнего матча: ${attendance.toLocaleString("ru-RU")} зрителей.`, `Home gate receipts: ${attendance.toLocaleString("en-US")} fans.`),
      fixture.round_no
    );
  } else {
    cash -= 110000;
    addFinanceEntry(
      -110000,
      "travel",
      localize("Расходы на выезд и логистику.", "Travel and logistics for an away match."),
      fixture.round_no
    );
  }

  const table = computeLeagueTable(club.league_id);
  const userRank = table.find((entry) => entry.clubId === club.id)?.rank || table.length;
  const reputationRank = [...table].sort((a, b) => b.strength - a.strength).findIndex((entry) => entry.clubId === club.id) + 1;
  const expectationDrift = reputationRank - userRank;
  const confidence = clamp(
    manager.board_confidence + resultDelta + expectationDrift * 2 + (cash < 0 ? -6 : 0),
    0,
    98
  );
  const fanMood = clamp(manager.fan_mood + resultDelta + Math.sign(expectationDrift), 25, 96);
  const jobStatus = confidence < 22 ? "sacked" : "active";

  const roundSummary = db.prepare(`
    SELECT
      f.id,
      f.home_score AS homeScore,
      f.away_score AS awayScore,
      f.competition_name AS competitionName,
      f.competition_stage AS competitionStage,
      f.result_note AS resultNote,
      home.name AS homeClubName,
      away.name AS awayClubName
    FROM fixtures f
    JOIN clubs home ON home.id = f.home_club_id
    JOIN clubs away ON away.id = f.away_club_id
    WHERE f.round_no = ? AND f.competition_name = ?
    ORDER BY f.id
  `).all(fixture.round_no, fixture.competition_name);

  updateManagerFinancials({
    cash,
    boardConfidence: confidence,
    fanMood,
    currentRound: fixture.round_no + 1,
    lastSummaryJson: JSON.stringify(roundSummary),
    jobStatus,
  });
}

function startLiveMatch() {
  const manager = getManager();
  if (!manager) {
    throw new Error(localize("Сначала начни новую карьеру.", "Start a new game first."));
  }
  if (manager.job_status !== "active") {
    throw new Error(localize("Совет директоров уже уволил тебя. Начни новую карьеру.", "The board has already dismissed you. Start a new game."));
  }

  const existing = db.prepare("SELECT * FROM live_match WHERE id = 1 AND is_active = 1").get();
  if (existing) {
    return JSON.parse(existing.state_json);
  }

  const fixture = getNextFixture(manager.club_id);
  if (!fixture) {
    throw new Error(localize("У клуба сейчас нет запланированного матча.", "No pending match found."));
  }

  const homeClub = db.prepare("SELECT * FROM clubs WHERE id = ?").get(fixture.home_club_id);
  const awayClub = db.prepare("SELECT * FROM clubs WHERE id = ?").get(fixture.away_club_id);
  const leagueTable = computeLeagueTable(homeClub.league_id);
  const home = buildMatchTeam(fixture.home_club_id, { humanControlled: fixture.home_club_id === manager.club_id });
  const away = buildMatchTeam(fixture.away_club_id, { humanControlled: fixture.away_club_id === manager.club_id });
  const weather = fixture.weather_json ? JSON.parse(fixture.weather_json) : generateWeather();
  const attendanceEstimate = estimateLiveAttendance(fixture, homeClub, awayClub, manager.club_id, leagueTable);
  const humanSide = fixture.home_club_id === manager.club_id ? "home" : "away";
  db.prepare("UPDATE fixtures SET weather_json = ?, attendance_estimate = ? WHERE id = ?")
    .run(JSON.stringify(weather), attendanceEstimate, fixture.id);

  const state = createLiveState(
    {
      id: fixture.id,
      roundNo: fixture.round_no,
      homeClubId: fixture.home_club_id,
      awayClubId: fixture.away_club_id,
      matchContext: {
        matchDate: fixture.match_date,
        competitionType: fixture.competition_type,
        competitionName: fixture.competition_name,
        competitionStage: fixture.competition_stage,
        referee: fixture.referee,
        weather,
        attendanceEstimate,
        language: manager.language || "ru",
      },
    },
    home,
    away
  );

  state.preMatchSpeechOptions = buildSpeechOptions("pregame");
  state.halfTimeSpeechOptions = buildSpeechOptions("halftime");
  state.matchContext.homeLineup = home.starters.map((player) => ({ id: player.id, name: player.name, position: player.position, overall: player.overall }));
  state.matchContext.awayLineup = away.starters.map((player) => ({ id: player.id, name: player.name, position: player.position, overall: player.overall }));
  state.matchContext.humanSide = humanSide;
  const aiSide = humanSide === "home" ? "away" : "home";
  const aiSpeech = buildSpeechOptions("ai-pregame")[0];
  state[aiSide].moraleBoost += aiSpeech.moraleDelta;
  state[aiSide].focusBoost += aiSpeech.focusDelta;

  db.prepare(`
    INSERT INTO live_match (id, fixture_id, state_json, is_active)
    VALUES (1, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      fixture_id = excluded.fixture_id,
      state_json = excluded.state_json,
      is_active = 1
  `).run(fixture.id, JSON.stringify(state));

  return state;
}

function advanceLiveMatch() {
  const row = db.prepare("SELECT * FROM live_match WHERE id = 1 AND is_active = 1").get();
  if (!row) {
    throw new Error(localize("Сейчас нет матча в прямом эфире.", "No live match in progress."));
  }

  let state = JSON.parse(row.state_json);
  state = simulateMinute(state);

  if (state.status === "finished") {
    const fixture = getFixtureById(row.fixture_id);
    applyMatchOutcome(fixture, state);
    simulateOtherFixturesForRound(fixture.round_no, fixture.id);
    progressKnockoutCompetitions(fixture.round_no);
    resolveTransferOffersForRound(fixture.round_no + 1);
    updateManagerAfterRound(fixture, state);
    if (fixture.round_no % 5 === 0) {
      refreshTransferMarket();
    }
    db.prepare("UPDATE live_match SET state_json = ?, is_active = 0 WHERE id = 1").run(JSON.stringify(state));
  } else {
    db.prepare("UPDATE live_match SET state_json = ? WHERE id = 1").run(JSON.stringify(state));
  }

  return state;
}

function fastForwardLiveMatch() {
  const row = db.prepare("SELECT * FROM live_match WHERE id = 1 AND is_active = 1").get();
  if (!row) {
    throw new Error(localize("Сейчас нет матча в прямом эфире.", "No live match in progress."));
  }

  let state = JSON.parse(row.state_json);
  state = fastForwardMatch(state);

  const fixture = getFixtureById(row.fixture_id);
  applyMatchOutcome(fixture, state);
  simulateOtherFixturesForRound(fixture.round_no, fixture.id);
  progressKnockoutCompetitions(fixture.round_no);
  resolveTransferOffersForRound(fixture.round_no + 1);
  updateManagerAfterRound(fixture, state);
  if (fixture.round_no % 5 === 0) {
    refreshTransferMarket();
  }
  db.prepare("UPDATE live_match SET state_json = ?, is_active = 0 WHERE id = 1").run(JSON.stringify(state));
  return state;
}

function handleLiveAction(action) {
  const row = db.prepare("SELECT * FROM live_match WHERE id = 1 AND is_active = 1").get();
  if (!row) {
    throw new Error(localize("Сейчас нет матча в прямом эфире.", "No live match in progress."));
  }

  const managerClub = getManagerClub();
  const state = JSON.parse(row.state_json);
  const side = state.home.clubId === managerClub.id ? "home" : "away";
  const speechOption =
    action.type === "speech"
      ? (action.stage === "halftime" ? state.halfTimeSpeechOptions : state.preMatchSpeechOptions)
          .find((option) => option.id === action.optionId)
      : null;
  const updatedState = applyMatchAction(state, {
    ...action,
    side,
    option: speechOption,
  });
  db.prepare("UPDATE live_match SET state_json = ? WHERE id = 1").run(JSON.stringify(updatedState));
  return updatedState;
}

async function initializeGame({ seedOnly = false } = {}) {
  createSchema();
  await ensureHistoricalSeed();
  if (seedOnly) {
    return;
  }
}

function startNewGame(clubId, managerName, language = "ru") {
  initializeRuntimeFromSeed(Number(clubId), managerName);
  setLanguage(language);
  return buildState();
}

module.exports = {
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
};
