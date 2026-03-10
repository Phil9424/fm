const REFEREES = [
  "Howard Webb",
  "Mark Halsey",
  "Steve Bennett",
  "Massimo Busacca",
  "Frank De Bleeckere",
  "Rob Styles",
  "Undiano Mallenco",
  "Manuel Mejuto Gonzalez",
  "Pierluigi Collina",
  "Wolfgang Stark",
  "Herbert Fandel",
  "Lubos Michel",
  "Viktor Kassai",
  "Konrad Plautz",
];

const WEATHER_TYPES = [
  { key: "clear", ru: "Ясно", en: "Clear", temperature: [12, 28] },
  { key: "cloudy", ru: "Облачно", en: "Cloudy", temperature: [8, 20] },
  { key: "rain", ru: "Дождь", en: "Rain", temperature: [5, 18] },
  { key: "windy", ru: "Ветрено", en: "Windy", temperature: [4, 16] },
  { key: "fog", ru: "Туман", en: "Fog", temperature: [3, 11] },
  { key: "cold", ru: "Холодно", en: "Cold", temperature: [-2, 7] },
];

const TALK_LIBRARY = [
  { ru: "Сегодня мы задаем темп с первой минуты.", en: "We set the tempo from the first minute today.", moraleDelta: 4, focusDelta: 1 },
  { ru: "Никто не ждет идеала, я жду только характера.", en: "Nobody expects perfection, only character.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Оставьте сомнения в раздевалке и играйте смело.", en: "Leave doubt in the dressing room and play with courage.", moraleDelta: 4, focusDelta: 1 },
  { ru: "Каждый подбор, каждый стык, каждая секунда должны быть нашими.", en: "Every second ball, every duel, every second must be ours.", moraleDelta: 3, focusDelta: 1 },
  { ru: "Мы здесь не выживать, а навязывать свой футбол.", en: "We are here to impose our football, not survive.", moraleDelta: 4, focusDelta: 2 },
  { ru: "Работаем терпеливо, момент точно придет.", en: "Stay patient, the chance will come.", moraleDelta: 2, focusDelta: 3 },
  { ru: "Соперник нервничает, если мы держим мяч.", en: "The opponent gets nervous when we keep the ball.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Сначала дисциплина, потом красота.", en: "Discipline first, beauty second.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Хочу увидеть, что вы готовы умереть за эмблему.", en: "Show me you are ready to fight for the badge.", moraleDelta: 5, focusDelta: -1 },
  { ru: "Сделайте трибуны нашими союзниками.", en: "Turn the stands into our ally.", moraleDelta: 3, focusDelta: 1 },
  { ru: "Вы сильнее, чем думаете. Просто покажите это.", en: "You are stronger than you think. Show it.", moraleDelta: 4, focusDelta: 2 },
  { ru: "Первые пятнадцать минут должны принадлежать нам.", en: "The first fifteen minutes must belong to us.", moraleDelta: 3, focusDelta: 1 },
  { ru: "Не бойтесь рисковать между линиями.", en: "Do not be afraid to take risks between the lines.", moraleDelta: 2, focusDelta: 3 },
  { ru: "Собранность без мяча решит исход этой игры.", en: "Your concentration without the ball will decide this match.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Сегодня ваш шанс переписать сезон.", en: "Today is your chance to rewrite the season.", moraleDelta: 4, focusDelta: 1 },
  { ru: "Не реагируйте на провокации, играйте с холодной головой.", en: "Ignore provocation and stay calm.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Победа начинается с уверенного первого паса.", en: "Victory starts with the first confident pass.", moraleDelta: 3, focusDelta: 3 },
  { ru: "Если прессингуем, то всей командой.", en: "If we press, we press together.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Каждый удар по воротам должен быть осмысленным.", en: "Every shot must mean something.", moraleDelta: 2, focusDelta: 3 },
  { ru: "Соперник побежит, а мы накажем его пространством.", en: "They will rush, and we will punish the space they leave.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Пусть они почувствуют наше давление сразу.", en: "Let them feel our pressure immediately.", moraleDelta: 4, focusDelta: 1 },
  { ru: "Сегодня дисциплина важнее эмоций.", en: "Discipline matters more than emotion today.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Я верю в вас больше, чем вы сами сейчас.", en: "I believe in you more than you believe in yourselves right now.", moraleDelta: 4, focusDelta: 1 },
  { ru: "Терпение и хладнокровие, вот наше оружие.", en: "Patience and composure are our weapons.", moraleDelta: 2, focusDelta: 3 },
  { ru: "Оставьте в поле все, а разговоры будут потом.", en: "Leave everything on the pitch, save the talk for later.", moraleDelta: 4, focusDelta: 0 },
  { ru: "Мы обязаны сыграть умнее, не только жестче.", en: "We must play smarter, not just harder.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Каждый из вас способен решить матч одним действием.", en: "Any one of you can decide this match with one action.", moraleDelta: 4, focusDelta: 2 },
  { ru: "Если чувствуете темп, давите до конца.", en: "If you feel the tempo, drive it to the end.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Ваша энергия может переломить любую серию.", en: "Your energy can break any bad run.", moraleDelta: 4, focusDelta: 1 },
  { ru: "Сделайте так, чтобы соперник пожалел о выходе на поле.", en: "Make the opponent regret stepping onto the pitch.", moraleDelta: 5, focusDelta: -1 },
  { ru: "Спокойствие на мяче, ярость в отборе.", en: "Calm on the ball, fierce in the tackle.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Не опускайте голову после ошибки, сразу исправляйте.", en: "Do not drop your heads after a mistake. Fix it immediately.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Эта игра про детали. Будьте взрослее в деталях.", en: "This game is about details. Be mature in the details.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Контролируйте эмоции, тогда контролируете матч.", en: "Control your emotions and you control the match.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Покажите свою личность, но в интересах команды.", en: "Show personality, but serve the team.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Мы готовы к тяжелому матчу, и это наше преимущество.", en: "We are ready for a tough match, and that is our edge.", moraleDelta: 3, focusDelta: 3 },
  { ru: "Работаем компактно, и моменты начнут сыпаться.", en: "Stay compact and the chances will come.", moraleDelta: 2, focusDelta: 3 },
  { ru: "Сегодня нам нужна не паника, а качество.", en: "Today we need quality, not panic.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Сделайте один лишний рывок ради партнера.", en: "Make one extra run for your teammate.", moraleDelta: 4, focusDelta: 1 },
  { ru: "Они дрогнут, если увидят нашу уверенность.", en: "They will wobble if they see our confidence.", moraleDelta: 4, focusDelta: 1 },
  { ru: "Не теряйте голову после пропущенного, матч длинный.", en: "Do not lose your heads after conceding. The match is long.", moraleDelta: 3, focusDelta: 3 },
  { ru: "Держим структуру, тогда и импровизация сработает.", en: "Hold the structure and the improvisation will work.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Сейчас сезон просит от вас зрелости.", en: "The season is asking for maturity from you now.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Сегодня мы обязаны быть быстрее в принятии решений.", en: "Today we must be quicker in our decisions.", moraleDelta: 3, focusDelta: 3 },
  { ru: "Выходите и заберите этот матч себе.", en: "Go out there and take this match for yourselves.", moraleDelta: 5, focusDelta: 0 },
  { ru: "Если понадобится страдать, страдаем вместе.", en: "If we need to suffer, we suffer together.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Дайте болельщикам повод верить еще сильнее.", en: "Give the supporters another reason to believe.", moraleDelta: 4, focusDelta: 1 },
  { ru: "Нам не нужна идеальная игра, нам нужна победная.", en: "We do not need a perfect game, only a winning one.", moraleDelta: 3, focusDelta: 2 },
  { ru: "Сыграйте проще там, где матч просит простоты.", en: "Play simple where the match demands simplicity.", moraleDelta: 2, focusDelta: 4 },
  { ru: "Сегодня каждый должен превзойти самого себя.", en: "Today everyone has to outdo themselves.", moraleDelta: 5, focusDelta: 1 },
];

function getRandomItems(items, count) {
  const copy = [...items];
  const result = [];
  while (copy.length && result.length < count) {
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}

function buildSpeechOptions(stage) {
  return getRandomItems(TALK_LIBRARY, 5).map((entry, index) => ({
    id: `${stage}-${index + 1}-${Math.floor(Math.random() * 100000)}`,
    stage,
    ru: entry.ru,
    en: entry.en,
    moraleDelta: entry.moraleDelta,
    focusDelta: entry.focusDelta,
  }));
}

function generateWeather() {
  const weather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
  const [minTemp, maxTemp] = weather.temperature;
  return {
    key: weather.key,
    ru: weather.ru,
    en: weather.en,
    temperature: Math.floor(minTemp + Math.random() * (maxTemp - minTemp + 1)),
  };
}

module.exports = {
  REFEREES,
  WEATHER_TYPES,
  TALK_LIBRARY,
  buildSpeechOptions,
  generateWeather,
};
