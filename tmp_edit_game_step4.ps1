$path='server/game.js'
$text=Get-Content -Raw $path
$start=$text.IndexOf('function progressKnockoutCompetitions(')
$end=$text.IndexOf('function updateManagerAfterRound(', $start)
if($start -lt 0 -or $end -lt 0){throw 'progress block markers not found'}
$block=@"
function normalizeKnockoutStage(stage) {
  if (!stage) {
    return "";
  }
  return LEGACY_KNOCKOUT_STAGE_ALIASES[stage] || stage;
}

function groupCodeFromStage(stage) {
  const match = /^Group ([A-Z])/.exec(stage || "");
  return match ? match[1] : null;
}

function buildGroupStandingsForCompetition(competitionType, competitionName) {
  const fixtures = db.prepare(`
    SELECT
      f.home_club_id AS homeClubId,
      f.away_club_id AS awayClubId,
      f.home_score AS homeScore,
      f.away_score AS awayScore,
      f.competition_stage AS competitionStage,
      home.name AS homeClubName,
      away.name AS awayClubName,
      home.strength AS homeStrength,
      away.strength AS awayStrength
    FROM fixtures f
    JOIN clubs home ON home.id = f.home_club_id
    JOIN clubs away ON away.id = f.away_club_id
    WHERE f.competition_type = ?
      AND f.competition_name = ?
      AND f.status = 'played'
      AND f.competition_stage LIKE 'Group %'
  `).all(competitionType, competitionName);

  const groupTables = new Map();

  fixtures.forEach((fixture) => {
    const group = groupCodeFromStage(fixture.competitionStage);
    if (!group) {
      return;
    }

    if (!groupTables.has(group)) {
      groupTables.set(group, new Map());
    }

    const table = groupTables.get(group);
    const ensureRow = (clubId, clubName, strength) => {
      if (!table.has(clubId)) {
        table.set(clubId, {
          clubId,
          clubName,
          strength,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        });
      }
      return table.get(clubId);
    };

    const home = ensureRow(fixture.homeClubId, fixture.homeClubName, fixture.homeStrength);
    const away = ensureRow(fixture.awayClubId, fixture.awayClubName, fixture.awayStrength);

    home.played += 1;
    away.played += 1;
    home.goalsFor += fixture.homeScore;
    home.goalsAgainst += fixture.awayScore;
    away.goalsFor += fixture.awayScore;
    away.goalsAgainst += fixture.homeScore;

    if (fixture.homeScore > fixture.awayScore) {
      home.wins += 1;
      away.losses += 1;
      home.points += 3;
    } else if (fixture.homeScore < fixture.awayScore) {
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

  const rankedGroups = new Map();
  groupTables.forEach((table, group) => {
    const rows = [...table.values()]
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
      );
    rankedGroups.set(group, rows);
  });

  return rankedGroups;
}

function seedEuropeanKnockoutFromGroups(roundNo, competitionType, competitionName) {
  const standings = buildGroupStandingsForCompetition(competitionType, competitionName);
  const groupsReady = EURO_GROUP_NAMES.every((group) => standings.get(group)?.length >= 2);
  if (!groupsReady) {
    return;
  }

  const pairings = [
    [standings.get("A")[0], standings.get("B")[1]],
    [standings.get("B")[0], standings.get("A")[1]],
    [standings.get("C")[0], standings.get("D")[1]],
    [standings.get("D")[0], standings.get("C")[1]],
  ];

  const fixturesToInsert = pairings.map(([homeSeed, awaySeed]) => ({
    roundNo: roundNo + 4,
    competitionType,
    competitionName,
    competitionStage: "Quarter-final",
    homeClub: db.prepare("SELECT * FROM clubs WHERE id = ?").get(homeSeed.clubId),
    awayClub: db.prepare("SELECT * FROM clubs WHERE id = ?").get(awaySeed.clubId),
  }));

  insertKnockoutRound(fixturesToInsert);
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

    const stageRaw = fixtures[0].competition_stage || "";
    const existingNextRound = db.prepare(`
      SELECT id
      FROM fixtures
      WHERE round_no = ? AND competition_type = ? AND competition_name = ?
      LIMIT 1
    `).get(roundNo + 4, competition.competitionType, competition.competitionName);
    if (existingNextRound) {
      return;
    }

    if (stageRaw.startsWith("Group ")) {
      if (!stageRaw.includes("Matchday 6")) {
        return;
      }
      const pendingGroupFixtures = db.prepare(`
        SELECT COUNT(*) AS pending
        FROM fixtures
        WHERE competition_type = ?
          AND competition_name = ?
          AND competition_stage LIKE 'Group %'
          AND status != 'played'
      `).get(competition.competitionType, competition.competitionName)?.pending || 0;
      if (pendingGroupFixtures > 0) {
        return;
      }
      seedEuropeanKnockoutFromGroups(roundNo, competition.competitionType, competition.competitionName);
      return;
    }

    const currentStage = normalizeKnockoutStage(stageRaw);
    const currentIndex = KNOCKOUT_STAGE_SEQUENCE.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex >= KNOCKOUT_STAGE_SEQUENCE.length - 1) {
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
        roundNo: roundNo + 4,
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

"@
$newText=$text.Substring(0,$start)+$block+$text.Substring($end)
Set-Content -Path $path -Value $newText -Encoding UTF8
