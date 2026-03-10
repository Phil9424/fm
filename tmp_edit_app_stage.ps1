$path='public/app.js'
$text=Get-Content -Raw $path
$start=$text.IndexOf('function stageLabel(stage) {')
$end=$text.IndexOf('function money(value) {', $start)
if($start -lt 0 -or $end -lt 0){throw 'stageLabel markers not found'}
$block=@"
function stageLabel(stage) {
  const labels = {
    "1/8 С„РёРЅР°Р»Р°": { ru: "1/8 финала", en: "Round of 16" },
    "1/4 С„РёРЅР°Р»Р°": { ru: "1/4 финала", en: "Quarter-final" },
    "1/2 С„РёРЅР°Р»Р°": { ru: "1/2 финала", en: "Semi-final" },
    "Р¤РёРЅР°Р»": { ru: "Финал", en: "Final" },
    "Round of 16": { ru: "1/8 финала", en: "Round of 16" },
    "Quarter-final": { ru: "1/4 финала", en: "Quarter-final" },
    "Semi-final": { ru: "1/2 финала", en: "Semi-final" },
    "Final": { ru: "Финал", en: "Final" },
  };
  return labels[stage]?.[ui.language] || stage;
}

"@
$newText=$text.Substring(0,$start)+$block+$text.Substring($end)
Set-Content -Path $path -Value $newText -Encoding UTF8
