import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from bs4 import BeautifulSoup
from curl_cffi import requests


ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT / ".cache" / "fifaindex"
OUTPUT_FILE = ROOT / "server" / "data" / "fifa08-ratings.json"
BASE_URL = "https://www.fifaindex.com"
LIST_URL = f"{BASE_URL}/players/fifa08/"
IMPERSONATE = "chrome124"
WORKERS = 8


def fetch_text(url: str) -> str:
    cache_name = re.sub(r"[^a-zA-Z0-9]+", "_", url).strip("_") + ".html"
    cache_path = CACHE_DIR / cache_name
    if cache_path.exists():
        return cache_path.read_text(encoding="utf-8")

    last_error = None
    for attempt in range(4):
        try:
            response = requests.get(url, impersonate=IMPERSONATE, timeout=45)
            response.raise_for_status()
            text = response.text
            cache_path.write_text(text, encoding="utf-8")
            return text
        except Exception as error:  # noqa: BLE001
            last_error = error
            time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"Failed to fetch {url}: {last_error}")


def parse_total_pages(html: str) -> int:
    soup = BeautifulSoup(html, "lxml")
    pages = []
    for anchor in soup.select('a[href*="page="]'):
        href = anchor.get("href", "")
        match = re.search(r"page=(\d+)", href)
        if match:
            pages.append(int(match.group(1)))
    return max(pages) if pages else 1


def clean_team_name(value: str) -> str:
    return re.sub(r"\s+FIFA\s*08$", "", value or "", flags=re.IGNORECASE).strip()


def parse_page(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    players = []
    for row in soup.select("table tbody tr[data-playerid]"):
        player_link = row.select_one("td[data-title='Name'] a.link-player[href*='/player/']")
        rating_badges = row.select("td[data-title='OVR / POT'] span.rating")
        position_badge = row.select_one("td[data-title='Preferred Positions'] span.position")
        team_link = row.select_one("a.link-team")
        nationality_link = row.select_one("a.link-nation")
        age_cell = row.select_one("td[data-title='Age']")

        name = player_link.get_text(" ", strip=True) if player_link else ""
        href = player_link.get("href") if player_link else ""
        overall = int(rating_badges[0].get_text(strip=True)) if len(rating_badges) > 0 else 0
        potential = int(rating_badges[1].get_text(strip=True)) if len(rating_badges) > 1 else overall
        position = position_badge.get_text(" ", strip=True) if position_badge else ""
        team = clean_team_name(team_link.get("title", "") if team_link else "")
        nationality = nationality_link.get("title", "") if nationality_link else ""
        age_text = age_cell.get_text(" ", strip=True) if age_cell else "0"

        if not name or not overall:
            continue

        players.append(
            {
                "name": name,
                "overall": overall,
                "potential": potential,
                "position": position,
                "age": int(age_text or 0),
                "team": team,
                "nationality": nationality,
                "url": f"{BASE_URL}{href}" if href.startswith("/") else href,
            }
        )
    return players


def fetch_page(page_no: int) -> list[dict]:
    url = LIST_URL if page_no == 1 else f"{LIST_URL}?page={page_no}"
    html = fetch_text(url)
    return parse_page(html)


def main() -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    first_html = fetch_text(LIST_URL)
    total_pages = parse_total_pages(first_html)
    all_players = parse_page(first_html)

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        future_map = {
            executor.submit(fetch_page, page_no): page_no
            for page_no in range(2, total_pages + 1)
        }
        for future in as_completed(future_map):
            page_no = future_map[future]
            page_players = future.result()
            all_players.extend(page_players)
            print(f"Fetched page {page_no}/{total_pages}: {len(page_players)} players")

    payload = {
        "source": "https://www.fifaindex.com/players/fifa08/",
        "season": "FIFA 08",
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "player_count": len(all_players),
        "players": all_players,
    }
    OUTPUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(all_players)} ratings to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
