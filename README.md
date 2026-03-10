# Legacy Football Manager 07/08

Mobile-first browser football manager for the 2007-08 season.

## Run

```bash
npm install
npm run seed
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## What is already implemented

- SQLite database with 14 leagues across England, France, Portugal, Italy, Spain, Germany, and Russia
- Historical club names and era player rosters imported from archived season pages
- Mobile-first single-page interface
- New career flow and club selection
- Squad management with formations, mentality, style, starters, and bench
- Transfer market with buy and sell actions
- Finances: ticket pricing, stadium expansion, training camps, wage overview
- Board confidence and sack risk
- League table, upcoming fixtures, top scorers, round summaries
- Live text match engine with one in-game minute per real second
- Tactical changes and substitutions during the live match

## Current scope

The playable loop is league-first right now:

- League season simulation is fully playable
- Domestic cups and European competitions are presented as previewed competition boards
- Logos are fictional gradient badges generated from club names

## Next obvious upgrades

- Full playable domestic cups and European tournaments
- Save slots and multi-career support
- Better transfer AI and contract system
- Training injuries, suspensions, youth players, and staff
- PostgreSQL migration layer
