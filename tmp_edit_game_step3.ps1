$path='server/game.js'
$text=Get-Content -Raw $path
$start=$text.IndexOf('function resolveKnockoutWinner(')
$end=$text.IndexOf('function applyMatchOutcome(', $start)
if($start -lt 0 -or $end -lt 0){throw 'resolve block markers not found'}
$block=@"
function resolveKnockoutWinner(fixture, state) {
  const groupStage = typeof fixture.competition_stage === "string" && fixture.competition_stage.startsWith("Group ");
  if (fixture.competition_type === "league" || groupStage) {
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

"@
$newText = $text.Substring(0,$start)+$block+$text.Substring($end)
Set-Content -Path $path -Value $newText -Encoding UTF8
