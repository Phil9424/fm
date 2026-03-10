$path = 'server/game.js'
$text = Get-Content -Raw $path
$start = $text.IndexOf('function createGuestPlayersForClub(')
if ($start -lt 0) { throw 'start marker not found' }
$end = $text.IndexOf('function ensureRuntimeCompetitions(', $start)
if ($end -lt 0) { throw 'end marker not found' }

$block = @"
function createGuestPlayersForClub(club, startPlayerId) {
  const insertPlayer = db.prepare("INSERT INTO players (id, club_id, name, position, secondary_positions, nationality, birth_date, hometown, age, overall, attack, defense, passing, stamina, goalkeeping, wage, value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

  const positions = ["G", "G", "G", "D", "D", "D", "D", "D", "D", "D", "D", "M", "M", "M", "M", "M", "M", "M", "M", "F", "F", "F", "F", "F"];
  let playerId = startPlayerId;

  positions.forEach((position, index) => {
    const variance = Math.round((Math.random() - 0.5) * 8);
    const baseOverall = clamp(club.strength - 7 + variance + (position === "G" ? 1 : 0), 55, 86);
    const attack = clamp(baseOverall + (position === "F" ? 6 : position === "M" ? 2 : -8), 10, 94);
    const defense = clamp(baseOverall + (position === "D" ? 6 : position === "M" ? 1 : -10), 10, 94);
    const passing = clamp(baseOverall + (position === "M" ? 6 : position === "D" ? -1 : 1), 10, 94);
    const stamina = clamp(baseOverall + 3, 26, 95);
    const goalkeeping = clamp(position === "G" ? baseOverall + 7 : 10 + Math.round(Math.random() * 6), 10, 96);
    const age = 19 + Math.floor(Math.random() * 14);
    const birthYear = 2007 - age;
    const secondary = position === "G" ? [] : position === "D" ? ["M"] : position === "M" ? ["D", "F"] : ["M"];
    const wage = Math.round(baseOverall * baseOverall * 35);
    const value = Math.round(baseOverall * baseOverall * baseOverall * 90);

    insertPlayer.run(
      playerId,
      club.id,
      club.short_name + " Player " + (index + 1),
      position,
      JSON.stringify(secondary),
      club.country,
      String(birthYear) + "-07-01",
      club.country,
      age,
      Math.round(baseOverall),
      Math.round(attack),
      Math.round(defense),
      Math.round(passing),
      Math.round(stamina),
      Math.round(goalkeeping),
      wage,
      value
    );

    playerId += 1;
  });

  return playerId;
}

function ensureEuroGuestClubs() {
  const guestBlueprint = [
    { country: "Netherlands", name: "Ajax", shortName: "Ajax", strength: 81, reputation: 84 },
    { country: "Netherlands", name: "PSV Eindhoven", shortName: "PSV", strength: 79, reputation: 82 },
    { country: "Croatia", name: "Dinamo Zagreb", shortName: "Dinamo", strength: 74, reputation: 77 },
    { country: "Croatia", name: "Hajduk Split", shortName: "Hajduk", strength: 72, reputation: 74 },
    { country: "Czechia", name: "Sparta Prague", shortName: "Sparta", strength: 75, reputation: 78 },
    { country: "Czechia", name: "Slavia Prague", shortName: "Slavia", strength: 74, reputation: 77 },
    { country: "Scotland", name: "Celtic", shortName: "Celtic", strength: 77, reputation: 80 },
    { country: "Scotland", name: "Rangers", shortName: "Rangers", strength: 77, reputation: 80 },
    { country: "Belgium", name: "Anderlecht", shortName: "Anderlecht", strength: 75, reputation: 78 },
    { country: "Turkey", name: "Galatasaray", shortName: "Galatasaray", strength: 78, reputation: 81 }
  ];

  const existingNames = new Set(db.prepare("SELECT name FROM clubs").all().map((row) => row.name));
  const leagueByCountry = new Map(db.prepare("SELECT id, country FROM leagues WHERE tier = 1").all().map((row) => [row.country, row.id]));

  let nextLeagueId = (db.prepare("SELECT MAX(id) AS maxId FROM leagues").get()?.maxId || 0) + 1;
  let nextClubId = (db.prepare("SELECT MAX(id) AS maxId FROM clubs").get()?.maxId || 0) + 1;
  let nextPlayerId = (db.prepare("SELECT MAX(id) AS maxId FROM players").get()?.maxId || 0) + 1;

  const insertLeague = db.prepare("INSERT INTO leagues (id, country, name, tier, season, slug) VALUES (?, ?, ?, 1, ?, ?)");
  const insertClub = db.prepare("INSERT INTO clubs (id, league_id, country, tier, name, short_name, strength, reputation, stadium_capacity, ticket_price, balance, board_expectation, logo_primary, logo_secondary) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

  guestBlueprint.forEach((entry) => {
    if (existingNames.has(entry.name)) {
      return;
    }

    let leagueId = leagueByCountry.get(entry.country);
    if (!leagueId) {
      leagueId = nextLeagueId;
      nextLeagueId += 1;
      insertLeague.run(
        leagueId,
        entry.country,
        entry.country + " Premier",
        SEASON_LABEL,
        entry.country.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-premier"
      );
      leagueByCountry.set(entry.country, leagueId);
    }

    const hue = Math.abs(entry.name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 360;
    const primary = "hsl(" + hue + " 72% 46%)";
    const secondary = "hsl(" + ((hue + 36) % 360) + " 74% 34%)";
    const stadium = 30000 + Math.round(Math.random() * 22000);

    const club = {
      id: nextClubId,
      league_id: leagueId,
      country: entry.country,
      name: entry.name,
      short_name: entry.shortName,
      strength: entry.strength,
      reputation: entry.reputation,
      stadium_capacity: stadium,
      ticket_price: 16 + Math.round(Math.random() * 10),
      balance: 32000000 + Math.round(Math.random() * 18000000),
      board_expectation: "Compete for Europe",
      logo_primary: primary,
      logo_secondary: secondary
    };

    insertClub.run(
      club.id,
      club.league_id,
      club.country,
      club.name,
      club.short_name,
      club.strength,
      club.reputation,
      club.stadium_capacity,
      club.ticket_price,
      club.balance,
      club.board_expectation,
      club.logo_primary,
      club.logo_secondary
    );

    nextPlayerId = createGuestPlayersForClub(club, nextPlayerId);
    buildDefaultTacticForClub(club.id);
    nextClubId += 1;
  });
}

function pickEuropeanEntrants(clubs, targetCount, blockedIds = new Set()) {
  const grouped = groupByCountry(clubs.filter((club) => !blockedIds.has(club.id)));
  const orderedByCountry = [...grouped.values()].map((list) => [...list].sort((a, b) => b.reputation - a.reputation || b.strength - a.strength));
  const entrants = [];

  let depth = 0;
  while (entrants.length < targetCount) {
    let added = false;
    orderedByCountry.forEach((list) => {
      if (list[depth] && !entrants.some((club) => club.id === list[depth].id)) {
        entrants.push(list[depth]);
        added = true;
      }
    });
    if (!added) {
      break;
    }
    depth += 1;
  }

  if (entrants.length < targetCount) {
    clubs.forEach((club) => {
      if (entrants.length >= targetCount) {
        return;
      }
      if (blockedIds.has(club.id) || entrants.some((entry) => entry.id === club.id)) {
        return;
      }
      entrants.push(club);
    });
  }

  return entrants.slice(0, targetCount);
}

function groupStageLabel(groupName, matchday) {
  return "Group " + groupName + " - Matchday " + matchday;
}

function seedEuropeanCompetition(competitionType, competitionName, entrants) {
  if (entrants.length < 16) {
    return;
  }

  const sorted = [...entrants]
    .sort((a, b) => b.reputation - a.reputation || b.strength - a.strength || a.name.localeCompare(b.name))
    .slice(0, 16);

  const groups = EURO_GROUP_NAMES.reduce((map, name) => {
    map.set(name, []);
    return map;
  }, new Map());

  for (let pot = 0; pot < 4; pot += 1) {
    for (let slot = 0; slot < EURO_GROUP_NAMES.length; slot += 1) {
      const team = sorted[pot * EURO_GROUP_NAMES.length + slot];
      groups.get(EURO_GROUP_NAMES[slot]).push(team);
    }
  }

  const schedule = [
    [[0, 3], [1, 2]],
    [[2, 0], [1, 3]],
    [[0, 1], [3, 2]],
    [[3, 0], [2, 1]],
    [[0, 2], [3, 1]],
    [[1, 0], [2, 3]]
  ];

  const fixtures = [];
  groups.forEach((teams, groupName) => {
    schedule.forEach((matchdayPairs, index) => {
      const roundNo = EURO_GROUP_ROUNDS[index];
      matchdayPairs.forEach(([homeIndex, awayIndex]) => {
        fixtures.push({
          roundNo,
          competitionType,
          competitionName,
          competitionStage: groupStageLabel(groupName, index + 1),
          homeClub: teams[homeIndex],
          awayClub: teams[awayIndex]
        });
      });
    });
  });

  insertKnockoutRound(fixtures);
}

function seedKnockoutCompetitions(selectedClubId, _maxLeagueRound) {
  ensureEuroGuestClubs();
  const allClubs = db.prepare("SELECT * FROM clubs ORDER BY reputation DESC, strength DESC, name").all();
  const byCountry = groupByCountry(allClubs);
  const managerClub = db.prepare("SELECT * FROM clubs WHERE id = ?").get(selectedClubId);
  const domesticRound = 2;

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
          awayClub
        });
      });
    }
  });
  insertKnockoutRound(domesticFixtures);

  const topTierClubs = db.prepare("SELECT c.*, l.country, l.name AS league_name FROM clubs c JOIN leagues l ON l.id = c.league_id WHERE l.tier = 1 ORDER BY c.reputation DESC, c.strength DESC, c.name").all();

  const championsEntrants = pickEuropeanEntrants(topTierClubs, 16, new Set());
  const uefaEntrants = pickEuropeanEntrants(topTierClubs, 16, new Set(championsEntrants.map((club) => club.id)));

  seedEuropeanCompetition("champions", competitionDisplayName("champions"), championsEntrants);
  seedEuropeanCompetition("uefa", competitionDisplayName("uefa"), uefaEntrants);
}

"@

$newText = $text.Substring(0, $start) + $block + $text.Substring($end)
Set-Content -Path $path -Value $newText -Encoding UTF8
