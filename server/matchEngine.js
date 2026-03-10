const { clamp } = require("./historicalData");

const FORMATIONS = {
  "4-4-2": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "F", "F"],
  "4-3-3": ["G", "D", "D", "D", "D", "M", "M", "M", "F", "F", "F"],
  "4-2-3-1": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "M", "F"],
  "4-1-4-1": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "M", "F"],
  "4-5-1": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "M", "F"],
  "3-5-2": ["G", "D", "D", "D", "M", "M", "M", "M", "M", "F", "F"],
  "3-4-3": ["G", "D", "D", "D", "M", "M", "M", "M", "F", "F", "F"],
  "5-3-2": ["G", "D", "D", "D", "D", "D", "M", "M", "M", "F", "F"],
  "5-4-1": ["G", "D", "D", "D", "D", "D", "M", "M", "M", "M", "F"],
  "4-1-2-1-2": ["G", "D", "D", "D", "D", "M", "M", "M", "M", "F", "F"],
};

const MENTALITY_MODIFIERS = {
  ultraDefensive: { attack: 0.76, defense: 1.26, possession: 0.86, tempo: 0.84 },
  defensive: { attack: 0.88, defense: 1.14, possession: 0.94, tempo: 0.9 },
  balanced: { attack: 1, defense: 1, possession: 1, tempo: 1 },
  positive: { attack: 1.08, defense: 0.97, possession: 1.04, tempo: 1.05 },
  attacking: { attack: 1.18, defense: 0.9, possession: 1.06, tempo: 1.12 },
  allOut: { attack: 1.28, defense: 0.82, possession: 1.02, tempo: 1.18 },
};

const STYLE_MODIFIERS = {
  possession: { finishing: 0.98, passing: 1.15, discipline: 1.02, transition: 0.96 },
  tikiTaka: { finishing: 1.03, passing: 1.2, discipline: 1.04, transition: 0.98 },
  direct: { finishing: 1.1, passing: 0.92, discipline: 0.96, transition: 1.08 },
  counter: { finishing: 1.14, passing: 0.98, discipline: 1.01, transition: 1.14 },
  wingPlay: { finishing: 1.08, passing: 1.01, discipline: 0.98, transition: 1.06 },
  pressing: { finishing: 1.04, passing: 1.02, discipline: 0.94, transition: 1.1 },
  longBall: { finishing: 1.12, passing: 0.84, discipline: 0.93, transition: 1.1 },
};

const TACTIC_LABELS = {
  formation: {
    "4-4-2": { ru: "4-4-2", en: "4-4-2" },
    "4-3-3": { ru: "4-3-3", en: "4-3-3" },
    "4-2-3-1": { ru: "4-2-3-1", en: "4-2-3-1" },
    "4-1-4-1": { ru: "4-1-4-1", en: "4-1-4-1" },
    "4-5-1": { ru: "4-5-1", en: "4-5-1" },
    "3-5-2": { ru: "3-5-2", en: "3-5-2" },
    "3-4-3": { ru: "3-4-3", en: "3-4-3" },
    "5-3-2": { ru: "5-3-2", en: "5-3-2" },
    "5-4-1": { ru: "5-4-1", en: "5-4-1" },
    "4-1-2-1-2": { ru: "4-1-2-1-2", en: "4-1-2-1-2" },
  },
  mentality: {
    ultraDefensive: { ru: "ультраоборонительный", en: "ultra-defensive" },
    defensive: { ru: "оборонительный", en: "defensive" },
    balanced: { ru: "сбалансированный", en: "balanced" },
    positive: { ru: "позитивный", en: "positive" },
    attacking: { ru: "атакующий", en: "attacking" },
    allOut: { ru: "ва-банк", en: "all-out" },
  },
  style: {
    possession: { ru: "контроль мяча", en: "possession" },
    tikiTaka: { ru: "тики-така", en: "tiki-taka" },
    direct: { ru: "вертикальный", en: "direct" },
    counter: { ru: "контратаки", en: "counter" },
    wingPlay: { ru: "через фланги", en: "wing play" },
    pressing: { ru: "прессинг", en: "pressing" },
    longBall: { ru: "длинные передачи", en: "long ball" },
  },
};

function localize(language, ru, en) {
  return language === "en" ? en : ru;
}

function getLanguage(source) {
  const language = source?.matchContext?.language || source?.language || "ru";
  return language === "en" ? "en" : "ru";
}

function positionOrder(position) {
  return { G: 0, D: 1, M: 2, F: 3 }[position] ?? 4;
}

function secondaryPositionList(player) {
  const raw = player.secondaryPositions ?? player.secondary_positions ?? "[]";
  if (Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.startsWith("[")) {
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return [];
    }
  }
  if (typeof raw === "string") {
    return raw.split(",").map((value) => value.trim()).filter(Boolean);
  }
  return [];
}

function normalizePlayer(player) {
  return {
    ...player,
    morale: Number(player.morale ?? 70) || 70,
    fitness: Number(player.fitness ?? 88) || 88,
    overall: Number(player.overall ?? 60) || 60,
    attack: Number(player.attack ?? 40) || 40,
    defense: Number(player.defense ?? 40) || 40,
    passing: Number(player.passing ?? 40) || 40,
    stamina: Number(player.stamina ?? 45) || 45,
    goalkeeping: Number(player.goalkeeping ?? 12) || 12,
  };
}

function getFormationSlots(formation) {
  return FORMATIONS[formation] || FORMATIONS["4-4-2"];
}

function pickBestLineup(players, formation) {
  const slots = getFormationSlots(formation);
  const available = [...players]
    .map(normalizePlayer)
    .sort((a, b) => b.overall - a.overall || positionOrder(a.position) - positionOrder(b.position));
  const starters = [];

  for (const slot of slots) {
    let selectedIndex = available.findIndex((player) => player.position === slot);
    if (selectedIndex === -1) {
      selectedIndex = available.findIndex((player) => secondaryPositionList(player).includes(slot));
    }
    if (selectedIndex === -1) {
      selectedIndex = 0;
    }
    starters.push(available.splice(selectedIndex, 1)[0]);
  }

  const bench = available.slice(0, 7);
  const reserves = available.slice(7);
  return { starters, bench, reserves, slots };
}

function getFormationShapeBonus(formation) {
  const slots = getFormationSlots(formation);
  const defenders = slots.filter((slot) => slot === "D").length;
  const midfielders = slots.filter((slot) => slot === "M").length;
  const forwards = slots.filter((slot) => slot === "F").length;
  return {
    attack: 1 + (forwards - 2) * 0.05,
    defense: 1 + (defenders - 4) * 0.05,
    midfield: 1 + (midfielders - 4) * 0.04,
  };
}

function calculateTeamMetrics(team, matchContext = {}) {
  const starters = team.starters.map(normalizePlayer);
  const mentality = MENTALITY_MODIFIERS[team.mentality] || MENTALITY_MODIFIERS.balanced;
  const style = STYLE_MODIFIERS[team.style] || STYLE_MODIFIERS.possession;
  const formationBonus = getFormationShapeBonus(team.formation);

  const attackBase = starters.reduce((sum, player) => sum + player.attack + player.overall * 0.25, 0) / starters.length;
  const defenseBase = starters.reduce((sum, player) => sum + player.defense + player.overall * 0.18, 0) / starters.length;
  const passingBase = starters.reduce((sum, player) => sum + player.passing + player.overall * 0.2, 0) / starters.length;
  const staminaBase = starters.reduce((sum, player) => sum + player.stamina, 0) / starters.length;
  const moraleBase = starters.reduce((sum, player) => sum + player.morale, 0) / starters.length;
  const fitnessBase = starters.reduce((sum, player) => sum + player.fitness, 0) / starters.length;
  const goalkeepingBase =
    starters.find((player) => player.position === "G")?.goalkeeping ||
    starters.reduce((sum, player) => sum + player.goalkeeping, 0) / starters.length;

  const weatherPenalty =
    matchContext?.weather?.key === "rain" ? 0.96 :
    matchContext?.weather?.key === "windy" ? 0.95 :
    matchContext?.weather?.key === "fog" ? 0.94 :
    1;

  const moraleFactor = 0.9 + moraleBase / 700;
  const fitnessFactor = 0.88 + fitnessBase / 720;

  return {
    attack: attackBase * mentality.attack * style.finishing * formationBonus.attack * moraleFactor,
    defense: defenseBase * mentality.defense * formationBonus.defense * fitnessFactor,
    passing: passingBase * style.passing * mentality.possession * formationBonus.midfield * weatherPenalty,
    stamina: staminaBase,
    transition: (passingBase * 0.45 + attackBase * 0.3 + staminaBase * 0.25) * style.transition * mentality.tempo,
    goalkeeping: goalkeepingBase * fitnessFactor,
    discipline: clamp((defenseBase + passingBase) / 2 * style.discipline, 32, 94),
  };
}

function chooseWeighted(players, key) {
  const total = players.reduce((sum, player) => sum + Math.max(1, player[key]), 0);
  let cursor = Math.random() * total;
  for (const player of players) {
    cursor -= Math.max(1, player[key]);
    if (cursor <= 0) {
      return player;
    }
  }
  return players[0];
}

function tacticLabel(language, type, value) {
  return TACTIC_LABELS[type]?.[value]?.[language] || value;
}

function addCommentary(state, ru, en = ru) {
  state.commentary.push({ minute: state.minute, text: localize(getLanguage(state), ru, en) });
}

function createLiveState(fixture, home, away) {
  const language = getLanguage(fixture);
  return {
    fixtureId: fixture.id,
    roundNo: fixture.roundNo,
    minute: 0,
    status: "pregame",
    phase: "pregame",
    matchContext: fixture.matchContext || {},
    home: {
      clubId: fixture.homeClubId,
      clubName: home.clubName,
      formation: home.formation,
      mentality: home.mentality,
      style: home.style,
      starters: home.starters.map(normalizePlayer),
      bench: home.bench.map(normalizePlayer),
      metrics: calculateTeamMetrics(home, fixture.matchContext),
      substitutions: 0,
      aiChanges: 0,
      humanControlled: Boolean(home.humanControlled),
      moraleBoost: 0,
      focusBoost: 0,
    },
    away: {
      clubId: fixture.awayClubId,
      clubName: away.clubName,
      formation: away.formation,
      mentality: away.mentality,
      style: away.style,
      starters: away.starters.map(normalizePlayer),
      bench: away.bench.map(normalizePlayer),
      metrics: calculateTeamMetrics(away, fixture.matchContext),
      substitutions: 0,
      aiChanges: 0,
      humanControlled: Boolean(away.humanControlled),
      moraleBoost: 0,
      focusBoost: 0,
    },
    score: { home: 0, away: 0 },
    stats: {
      home: { shots: 0, shotsOnTarget: 0, possession: 50, yellow: 0, red: 0, xg: 0 },
      away: { shots: 0, shotsOnTarget: 0, possession: 50, yellow: 0, red: 0, xg: 0 },
    },
    commentary: [
      {
        minute: 0,
        text: localize(
          language,
          `${home.clubName} и ${away.clubName} уже в тоннеле. Сейчас начнутся командные речи.`,
          `${home.clubName} and ${away.clubName} are in the tunnel. Team talks are about to begin.`
        ),
      },
    ],
    events: [],
    substitutions: [],
    breakState: {
      pregameDone: false,
      halftimeDone: false,
    },
  };
}

function refreshTeamMetrics(team, matchContext) {
  team.metrics = calculateTeamMetrics(team, matchContext);
}

function fatigueLoss(player) {
  const staminaResistance = clamp((player.stamina - 40) / 110, 0, 0.4);
  const base = player.position === "G" ? 0.05 : 0.18;
  return clamp(base - staminaResistance * 0.09, 0.03, 0.2);
}

function applyFatigue(team) {
  team.starters = team.starters.map((player) => ({
    ...player,
    fitness: clamp(player.fitness - fatigueLoss(player), 45, 99),
  }));
}

function maybeCardEvent(state, side) {
  const language = getLanguage(state);
  const team = state[side];
  const opponentSide = side === "home" ? "away" : "home";
  const cardRoll = Math.random();

  if (cardRoll > 0.038) {
    return;
  }

  const outfieldPlayers = team.starters.filter((player) => player.position !== "G");
  if (!outfieldPlayers.length) {
    return;
  }

  const offender = chooseWeighted(outfieldPlayers, "defense");
  const isRed = cardRoll < 0.0045;
  state.stats[side][isRed ? "red" : "yellow"] += 1;
  state.events.push({
    minute: state.minute,
    type: isRed ? "red" : "yellow",
    side,
    playerId: offender.id,
    playerName: offender.name,
  });
  addCommentary(
    state,
    `${offender.name} получает ${isRed ? "красную" : "желтую"} карточку за ${team.clubName}.`,
    `${offender.name} receives a ${isRed ? "red" : "yellow"} card for ${team.clubName}.`
  );

  if (isRed) {
    offender.defense = Math.max(18, offender.defense - 12);
    offender.attack = Math.max(12, offender.attack - 7);
    refreshTeamMetrics(team, state.matchContext);
    state.stats[opponentSide].possession = clamp(state.stats[opponentSide].possession + 5, 35, 72);
    state.stats[side].possession = 100 - state.stats[opponentSide].possession;
  }
}

function performSubstitution(state, side, playerOutId, playerInId, automatic = false) {
  const team = state[side];
  if (team.substitutions >= 5) {
    return false;
  }

  const starterIndex = team.starters.findIndex((player) => player.id === playerOutId);
  const benchIndex = team.bench.findIndex((player) => player.id === playerInId);
  if (starterIndex === -1 || benchIndex === -1) {
    return false;
  }

  const [playerOut] = team.starters.splice(starterIndex, 1);
  const [playerIn] = team.bench.splice(benchIndex, 1);
  playerIn.fitness = clamp(playerIn.fitness + 4, 60, 99);
  team.starters.push(playerIn);
  team.bench.push(playerOut);
  team.substitutions += 1;
  refreshTeamMetrics(team, state.matchContext);

  state.substitutions.push({
    minute: state.minute,
    side,
    playerOutId: playerOut.id,
    playerInId: playerIn.id,
    automatic,
  });

  addCommentary(
    state,
    `${team.clubName} выпускает ${playerIn.name} вместо ${playerOut.name}.`,
    `${team.clubName} bring on ${playerIn.name} for ${playerOut.name}.`
  );
  return true;
}

function pickBenchReplacement(team, starter, scoreDiff) {
  const preferredPositions = [starter.position, ...secondaryPositionList(starter)];
  const candidates = team.bench
    .filter((player) => player.position !== "G" || starter.position === "G")
    .map((player) => ({
      player,
      fitScore:
        (preferredPositions.includes(player.position) ? 10 : 0) +
        secondaryPositionList(player).filter((pos) => preferredPositions.includes(pos)).length * 4 +
        player.overall * 0.9 +
        player.fitness * 0.3 +
        (scoreDiff < 0 ? player.attack * 0.18 : 0) +
        (scoreDiff > 0 ? player.defense * 0.14 : 0),
    }))
    .sort((a, b) => b.fitScore - a.fitScore);
  return candidates[0]?.player || null;
}

function maybeAiSubstitution(state, side) {
  const team = state[side];
  const opponentSide = side === "home" ? "away" : "home";
  if (team.humanControlled || team.substitutions >= 5 || !team.bench.length) {
    return;
  }

  const triggerMinute = [57, 71, 83].includes(state.minute);
  const scoreDiff = state.score[side] - state.score[opponentSide];
  if (!triggerMinute && !(state.minute >= 65 && scoreDiff < 0 && team.substitutions < 3)) {
    return;
  }

  const starters = team.starters
    .filter((player) => player.position !== "G")
    .map((player) => ({
      player,
      urgency:
        (72 - player.fitness) * 0.8 +
        (scoreDiff < 0 ? (65 - player.attack) * 0.35 : 0) +
        (scoreDiff > 0 ? (65 - player.defense) * 0.25 : 0),
    }))
    .sort((a, b) => b.urgency - a.urgency);

  for (const candidate of starters) {
    const replacement = pickBenchReplacement(team, candidate.player, scoreDiff);
    if (!replacement) {
      continue;
    }

    const shouldChange =
      candidate.player.fitness < 82 ||
      replacement.overall >= candidate.player.overall ||
      (scoreDiff < 0 && replacement.attack > candidate.player.attack + 4) ||
      (scoreDiff > 0 && replacement.defense > candidate.player.defense + 4);

    if (shouldChange && performSubstitution(state, side, candidate.player.id, replacement.id, true)) {
      return;
    }
  }
}

function maybeAdaptAi(state, side) {
  const team = state[side];
  const opponentSide = side === "home" ? "away" : "home";
  const opponent = state[opponentSide];
  if (team.humanControlled || team.aiChanges >= 3) {
    return;
  }

  const scoreDiff = state.score[side] - state.score[opponentSide];
  const triggerMinute = [28, 58, 74].includes(state.minute);
  if (!triggerMinute) {
    return;
  }

  if (scoreDiff < 0) {
    team.aiChanges += 1;
    team.mentality = team.mentality === "attacking" ? "allOut" : "attacking";
    team.style = team.style === "counter" ? "pressing" : "counter";
    if (team.formation === "4-4-2") {
      team.formation = "4-3-3";
    } else if (team.formation === "5-4-1") {
      team.formation = "4-2-3-1";
    } else if (team.formation === "4-5-1") {
      team.formation = "3-4-3";
    }
    refreshTeamMetrics(team, state.matchContext);
    addCommentary(
      state,
      `${team.clubName} идет ва-банк и перестраивается на ${team.formation}.`,
      `${team.clubName} push numbers forward and switch to ${team.formation}.`
    );
    return;
  }

  if (scoreDiff > 0 && state.minute >= 58) {
    team.aiChanges += 1;
    team.mentality = team.mentality === "balanced" ? "defensive" : "ultraDefensive";
    team.style = "counter";
    if (team.formation === "4-3-3") {
      team.formation = "4-5-1";
    } else if (team.formation === "3-4-3") {
      team.formation = "5-3-2";
    }
    refreshTeamMetrics(team, state.matchContext);
    addCommentary(
      state,
      `${team.clubName} садится ниже и начинает играть по счету.`,
      `${team.clubName} tighten up, drop deeper, and protect the lead.`
    );
    return;
  }

  if (scoreDiff === 0 && opponent.metrics.attack > team.metrics.attack + 8) {
    team.aiChanges += 1;
    team.mentality = "positive";
    team.style = "wingPlay";
    refreshTeamMetrics(team, state.matchContext);
    addCommentary(
      state,
      `${team.clubName} ускоряет фланги и меняет акценты в атаке.`,
      `${team.clubName} adjust the shape and look for faster transitions.`
    );
  }
}

function maybeChance(state, side) {
  const team = state[side];
  const opponentSide = side === "home" ? "away" : "home";
  const opponent = state[opponentSide];
  const attackBias =
    team.metrics.attack * 0.55 +
    team.metrics.transition * 0.25 +
    team.metrics.passing * 0.2 -
    (opponent.metrics.defense * 0.62 + opponent.metrics.goalkeeping * 0.18);

  const chanceProbability = clamp(0.11 + attackBias / 420 + (side === "home" ? 0.015 : 0), 0.045, 0.24);
  if (Math.random() > chanceProbability) {
    return;
  }

  const attackers = team.starters.filter((player) => player.position !== "G");
  const shooter = chooseWeighted(attackers, "attack");
  const assistPool = attackers.filter((player) => player.id !== shooter.id);
  const assister = assistPool.length ? chooseWeighted(assistPool, "passing") : null;
  const shotQuality = clamp(
    (shooter.attack * 0.58 + team.metrics.passing * 0.22 + team.metrics.transition * 0.2 - opponent.metrics.defense * 0.48) / 100,
    0.1,
    0.7
  );
  const onTargetChance = clamp(0.34 + shotQuality * 0.4, 0.24, 0.82);
  const goalChance = clamp(0.12 + shotQuality * 0.35 + (team.metrics.attack - opponent.metrics.goalkeeping) / 280, 0.07, 0.52);

  state.stats[side].shots += 1;
  state.stats[side].xg += Number((0.06 + shotQuality * 0.42).toFixed(2));

  if (Math.random() > onTargetChance) {
    const missText = Math.random() > 0.5
      ? ["бьет мимо ворот", "drags it wide"]
      : ["заряжает выше перекладины", "lashes over the bar"];
    addCommentary(state, `${shooter.name} ${missText[0]} за ${team.clubName}.`, `${shooter.name} ${missText[1]} for ${team.clubName}.`);
    return;
  }

  state.stats[side].shotsOnTarget += 1;

  if (Math.random() > goalChance) {
    const saveText = Math.random() > 0.5
      ? ["тащит удар", "makes the save"]
      : ["спасает команду шикарным сейвом", "parries brilliantly"];
    addCommentary(
      state,
      `Вратарь ${opponent.clubName} ${saveText[0]} после удара ${shooter.name}.`,
      `${opponent.clubName} keeper ${saveText[1]} from ${shooter.name}.`
    );
    return;
  }

  state.score[side] += 1;
  state.events.push({
    minute: state.minute,
    type: "goal",
    side,
    playerId: shooter.id,
    playerName: shooter.name,
    assistId: assister?.id || null,
    assistName: assister?.name || null,
  });
  addCommentary(
    state,
    `${shooter.name} забивает за ${team.clubName}${assister ? ` после передачи ${assister.name}` : ""}.`,
    `${shooter.name} scores for ${team.clubName}${assister ? `, assisted by ${assister.name}` : ""}.`
  );
}

function simulateMinute(state) {
  if (state.status !== "live") {
    return state;
  }

  state.minute += 1;

  applyFatigue(state.home);
  applyFatigue(state.away);
  if (state.minute % 5 === 0) {
    refreshTeamMetrics(state.home, state.matchContext);
    refreshTeamMetrics(state.away, state.matchContext);
  }

  maybeAdaptAi(state, "home");
  maybeAdaptAi(state, "away");
  maybeAiSubstitution(state, "home");
  maybeAiSubstitution(state, "away");

  const homeShare = clamp(
    50 +
      (state.home.metrics.passing - state.away.metrics.passing) / 5 +
      (state.home.metrics.transition - state.away.metrics.transition) / 14 +
      (Math.random() * 7 - 3.5),
    30,
    70
  );

  state.stats.home.possession = Math.round((state.stats.home.possession * (state.minute - 1) + homeShare) / state.minute);
  state.stats.away.possession = 100 - state.stats.home.possession;

  maybeCardEvent(state, "home");
  maybeCardEvent(state, "away");

  const homeChances = Math.random() > 0.58 ? 2 : 1;
  const awayChances = Math.random() > 0.64 ? 2 : 1;
  for (let index = 0; index < homeChances; index += 1) {
    maybeChance(state, "home");
  }
  for (let index = 0; index < awayChances; index += 1) {
    maybeChance(state, "away");
  }

  if (state.minute === 45) {
    state.status = "halftime";
    state.phase = "halftime";
    addCommentary(
      state,
      `Перерыв: ${state.home.clubName} ${state.score.home}-${state.score.away} ${state.away.clubName}.`,
      `Half-time: ${state.home.clubName} ${state.score.home}-${state.score.away} ${state.away.clubName}.`
    );
    return state;
  }

  if (state.minute >= 90) {
    state.status = "finished";
    state.phase = "fulltime";
    addCommentary(
      state,
      `Финальный свисток: ${state.home.clubName} ${state.score.home}-${state.score.away} ${state.away.clubName}.`,
      `Full-time: ${state.home.clubName} ${state.score.home}-${state.score.away} ${state.away.clubName}.`
    );
  }

  return state;
}

function applySpeechEffect(team, option) {
  team.moraleBoost += option.moraleDelta;
  team.focusBoost += option.focusDelta;
  team.starters = team.starters.map((player) => ({
    ...player,
    morale: clamp(player.morale + option.moraleDelta, 45, 98),
    fitness: clamp(player.fitness + option.focusDelta * 0.3, 50, 98),
  }));
}

function applyMatchAction(state, action) {
  const side = action.side || state.matchContext?.humanSide || "home";
  const team = state[side];
  if (!team) {
    return state;
  }

  if (action.type === "speech" && action.option) {
    applySpeechEffect(team, action.option);
    refreshTeamMetrics(team, state.matchContext);
    addCommentary(
      state,
      `${team.clubName} очень живо реагирует на речь тренера.`,
      `${team.clubName} respond to the team talk with fresh energy.`
    );
    if (action.stage === "pregame") {
      state.breakState.pregameDone = true;
      state.status = "live";
      state.phase = "firstHalf";
      addCommentary(
        state,
        `${state.home.clubName} и ${state.away.clubName} начинают матч.`,
        `${state.home.clubName} and ${state.away.clubName} kick off.`
      );
    }
    if (action.stage === "halftime") {
      state.breakState.halftimeDone = true;
      state.status = "live";
      state.phase = "secondHalf";
      addCommentary(state, "Второй тайм начался.", "The second half is underway.");
    }
    return state;
  }

  if (action.type === "resume") {
    if (state.status === "pregame") {
      state.breakState.pregameDone = true;
      state.status = "live";
      state.phase = "firstHalf";
      addCommentary(
        state,
        `${state.home.clubName} и ${state.away.clubName} начинают матч.`,
        `${state.home.clubName} and ${state.away.clubName} kick off.`
      );
    } else if (state.status === "halftime") {
      state.breakState.halftimeDone = true;
      state.status = "live";
      state.phase = "secondHalf";
      addCommentary(state, "Второй тайм начался.", "The second half is underway.");
    }
    return state;
  }

  if (action.type === "tactics") {
    if (action.formation && FORMATIONS[action.formation]) {
      team.formation = action.formation;
    }
    if (action.mentality) {
      team.mentality = action.mentality;
    }
    if (action.style) {
      team.style = action.style;
    }
    refreshTeamMetrics(team, state.matchContext);
    const language = getLanguage(state);
    addCommentary(
      state,
      `${team.clubName} перестраивается: ${tacticLabel(language, "formation", team.formation)}, ${tacticLabel(language, "style", team.style)}, ${tacticLabel(language, "mentality", team.mentality)}.`,
      `${team.clubName} switch to ${team.formation} with a ${team.style} ${team.mentality} approach.`
    );
    return state;
  }

  if (action.type === "substitution") {
    performSubstitution(state, side, action.playerOutId, action.playerInId, false);
    return state;
  }

  return state;
}

function fastForwardMatch(state) {
  while (state.status !== "finished") {
    if (state.status === "pregame" || state.status === "halftime") {
      state = applyMatchAction(state, { type: "resume", side: state.matchContext?.humanSide || "home" });
      continue;
    }
    state = simulateMinute(state);
  }
  return state;
}

function simulateInstantMatch(fixture, home, away) {
  const state = createLiveState(fixture, home, away);
  return fastForwardMatch({
    ...state,
    status: "live",
    phase: "firstHalf",
    breakState: {
      ...state.breakState,
      pregameDone: true,
    },
  });
}

module.exports = {
  FORMATIONS,
  MENTALITY_MODIFIERS,
  STYLE_MODIFIERS,
  createLiveState,
  simulateMinute,
  simulateInstantMatch,
  fastForwardMatch,
  applyMatchAction,
  pickBestLineup,
  getFormationSlots,
};
