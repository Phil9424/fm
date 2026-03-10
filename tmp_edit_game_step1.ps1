$path='server/game.js'
$text = Get-Content -Raw $path
$orig = $text

function ReplaceRegex([string]$source, [string]$pattern, [string]$replacement, [string]$label) {
  $new = [regex]::Replace($source, $pattern, $replacement)
  if ($new -eq $source) {
    throw "Failed to patch: $label"
  }
  return $new
}

$replacementConstants = @"
const KNOCKOUT_STAGE_SEQUENCE = ["Round of 16", "Quarter-final", "Semi-final", "Final"];
const LEGACY_KNOCKOUT_STAGE_ALIASES = {
  "1/8 финала": "Round of 16",
  "1/4 финала": "Quarter-final",
  "1/2 финала": "Semi-final",
  "Финал": "Final",
};
const EURO_GROUP_NAMES = ["A", "B", "C", "D"];
const EURO_GROUP_ROUNDS = [4, 8, 12, 16, 20, 24];
"@
$text = ReplaceRegex $text 'const KNOCKOUT_STAGE_SEQUENCE = \[[^\]]+\];' $replacementConstants 'constants'

$replacementRoundDate = @"
function buildRoundDate(roundNo, competitionType = "league") {
  const start = new Date("2007-08-11T15:00:00Z");
  const weekOffset = Math.floor((roundNo - 1) / 2) * 7;
  const date = new Date(start);
  date.setUTCDate(start.getUTCDate() + weekOffset);

  if (roundNo % 2 === 0) {
    const midweekOffset = competitionType === "champions" ? 4 : 5;
    date.setUTCDate(date.getUTCDate() + midweekOffset);
  }

  return date.toISOString().slice(0, 10);
}

function buildFixtureMeta
"@
$text = ReplaceRegex $text '(?s)function buildRoundDate\(roundNo\) \{.*?\}\r?\n\r?\nfunction buildFixtureMeta\b' $replacementRoundDate 'buildRoundDate'

$text = ReplaceRegex $text 'matchDate: buildRoundDate\(roundNo\),' 'matchDate: buildRoundDate(roundNo, overrides.competitionType || "league"),' 'buildFixtureMeta match date'

if (-not $text.Contains('roundIndex + 1')) {
  throw 'No league roundIndex + 1 marker found'
}
$text = $text.Replace('roundIndex + 1', '(roundIndex * 2) + 1')

if ($text -eq $orig) {
  throw 'No changes applied in step 1'
}

Set-Content -Path $path -Value $text -Encoding UTF8
