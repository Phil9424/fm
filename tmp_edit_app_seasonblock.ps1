$path='public/app.js'
$text=Get-Content -Raw $path
$start=$text.IndexOf('if (ui.tab === "season") {')
$end=$text.IndexOf('if (ui.tab === "match") {', $start)
if($start -lt 0 -or $end -lt 0){throw 'season block markers not found'}
$block=@"
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
    document.querySelector("[data-toggle-cups='all']")?.addEventListener("click", () => {
      ui.showAllCups = true;
      render();
    });
    document.querySelector("[data-toggle-cups='mine']")?.addEventListener("click", () => {
      ui.showAllCups = false;
      render();
    });
  }

"@
$newText=$text.Substring(0,$start)+$block+$text.Substring($end)
Set-Content -Path $path -Value $newText -Encoding UTF8
