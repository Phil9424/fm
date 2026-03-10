$path='server/game.js'
$text=Get-Content -Raw $path
$start=$text.IndexOf('function getCompetitionOverview(')
$end=$text.IndexOf('function buildState(', $start)
if($start -lt 0 -or $end -lt 0){throw 'competition overview markers not found'}
$block=@"
function getCompetitionOverview(managerClub) {
  const competitions = db.prepare(
    "SELECT competition_name AS competitionName, competition_type AS competitionType FROM fixtures WHERE competition_type != 'league' GROUP BY competition_name, competition_type ORDER BY CASE competition_type WHEN 'champions' THEN 1 WHEN 'uefa' THEN 2 ELSE 3 END, competition_name"
  ).all();

  const cards = competitions.map((competition) => {
    const fixtures = db.prepare(
      "SELECT f.id, f.round_no AS roundNo, f.status, f.competition_stage AS competitionStage, f.home_score AS homeScore, f.away_score AS awayScore, f.result_note AS resultNote, f.match_date AS matchDate, home.id AS homeClubId, away.id AS awayClubId, home.name AS homeClubName, away.name AS awayClubName, home.country AS homeCountry, away.country AS awayCountry FROM fixtures f JOIN clubs home ON home.id = f.home_club_id JOIN clubs away ON away.id = f.away_club_id WHERE f.competition_name = ? AND f.competition_type = ? ORDER BY f.round_no ASC, f.id ASC"
    ).all(competition.competitionName, competition.competitionType);

    const upcoming = fixtures.filter((fixture) => fixture.status === "pending");
    const played = fixtures.filter((fixture) => fixture.status === "played");
    const stage = upcoming[0]?.competitionStage || played[played.length - 1]?.competitionStage || null;
    const involvesManager = fixtures.some((fixture) => fixture.homeClubId === managerClub.id || fixture.awayClubId === managerClub.id);
    const sameCountry = competition.competitionType === "cup"
      ? fixtures.some((fixture) => fixture.homeCountry === managerClub.country || fixture.awayCountry === managerClub.country)
      : false;

    const standings = ["champions", "uefa"].includes(competition.competitionType)
      ? buildGroupStandingsForCompetition(competition.competitionType, competition.competitionName)
      : new Map();

    return {
      name: competition.competitionName,
      type: competition.competitionType,
      currentStage: stage,
      remainingFixtures: upcoming.length,
      nextFixtures: upcoming.slice(0, 4),
      recentResults: played.slice(-4).reverse(),
      totalFixtures: fixtures.length,
      involvesManager,
      sameCountry,
      fixtureTable: fixtures.slice(0, 24),
      groupTables: [...standings.entries()].map(([group, rows]) => ({ group, rows })),
    };
  });

  return {
    europe: cards.filter((card) => ["champions", "uefa"].includes(card.type)),
    domesticCups: cards.filter((card) => card.type === "cup"),
  };
}

"@
$newText=$text.Substring(0,$start)+$block+$text.Substring($end)
Set-Content -Path $path -Value $newText -Encoding UTF8
