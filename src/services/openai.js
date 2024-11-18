import OpenAI from 'openai';
import { primaryEmotions } from './primary-emotions-structure';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export function generateCSECode(emotions) {
  const emotionCodes = emotions.map(e => e.code).sort().join('.');
  const intensities = emotions
    .sort((a, b) => a.code.localeCompare(b.code))
    .map(e => getIntensityLevel(e.intensity))
    .join('.');
  return `CSE-[${emotionCodes}]-[${intensities}]-001`;
}

function getIntensityLevel(value) {
  if (value <= 3) return 'L';
  if (value <= 7) return 'M';
  return 'H';
}

// Stałe reakcje fizyczne dla każdej emocji i poziomu
const PHYSICAL_REACTIONS = {
  'DI': {
    'L': 'lekkie zmarszczenie nosa',
    'M': 'wyraźne zmarszczenie nosa, lekko uniesiona górna warga',
    'H': 'silne zmarszczenie nosa, uniesiona górna warga, cofnięcie głowy'
  },
  'FE': {
    'L': 'lekkie napięcie ramion, delikatnie rozszerzone oczy',
    'M': 'napięte ramiona, rozszerzone oczy, przyspieszony oddech',
    'H': 'bardzo napięte mięśnie, mocno rozszerzone oczy, płytki oddech'
  },
  'JO': {
    'L': 'lekki uśmiech, rozluźnione ramiona',
    'M': 'wyraźny uśmiech, wyprostowana postawa',
    'H': 'szeroki uśmiech, wyprostowana postawa, żywa gestykulacja'
  },
  'AG': {
    'L': 'lekko zaciśnięte szczęki, napięte dłonie',
    'M': 'zaciśnięte szczęki, napięte dłonie, szybszy oddech',
    'H': 'mocno zaciśnięte szczęki, bardzo napięte dłonie, gwałtowny oddech'
  },
  'TR': {
    'L': 'lekko rozluźnione ramiona, spokojny oddech',
    'M': 'rozluźnione ramiona, otwarty wyraz twarzy',
    'H': 'całkowicie rozluźnione ciało, bardzo otwarty wyraz twarzy'
  },
  'SA': {
    'L': 'lekko opuszczone kąciki ust, spowolnione ruchy',
    'M': 'opuszczone kąciki ust, wyraźnie spowolnione ruchy',
    'H': 'mocno opuszczone kąciki ust, bardzo spowolnione ruchy, pochylone ramiona'
  },
  'AN': {
    'L': 'lekko pochylona głowa, skupione spojrzenie',
    'M': 'pochylona głowa, wyraźnie skupione spojrzenie, lekko napięte mięśnie',
    'H': 'mocno pochylona głowa, intensywnie skupione spojrzenie, napięte mięśnie'
  },
  'SU': {
    'L': 'lekko uniesione brwi, delikatnie rozwarte usta',
    'M': 'uniesione brwi, rozwarte usta, lekko cofnięta głowa',
    'H': 'wysoko uniesione brwi, szeroko rozwarte usta, wyraźnie cofnięta głowa'
  }
};

function generateUserPrompt(emotions) {
  const cseCode = generateCSECode(emotions);
  const emotionsList = emotions.map(e => {
    const emotion = primaryEmotions[e.code];
    const level = getIntensityLevel(e.intensity);
    const variant = emotion.variants[level];
    return `${emotion.translation} (${e.intensity}/10) = ${variant.translation}`;
  }).join(' + ');

  const requiredReactions = emotions.map(e => {
    const level = getIntensityLevel(e.intensity);
    return `${e.code}.${level}: ${PHYSICAL_REACTIONS[e.code][level]}`;
  }).join('\n');

  return `KOD: ${cseCode}
EMOCJE: ${emotionsList}

FORMAT ODPOWIEDZI:

1. NAZWA
[Polski termin/Termin obcy/Neologizm] - [max 8 słów opisu, bez nazywania emocji]

2. SYTUACJA
A1: [Miejsce, czas, kontekst codzienny, max 2 zdania]
A2: [Tylko podane reakcje fizyczne + szczegóły otoczenia, max 2 zdania]

WYMAGANE REAKCJE:
${requiredReactions}

ZASADY:
- Tylko wymienione reakcje fizyczne
- Narracja w 3. osobie
- Bez emocji w opisie
- Codzienna sytuacja
- Wszystko dzieje się jednocześnie`;
}

export async function analyzeEmotions(emotions) {
  try {
    const systemPrompt = `Jesteś ekspertem od analizy emocji. Tworzysz opisy:
- Używając tylko podanych reakcji fizycznych
- Bez słów opisujących emocje
- W kontekście codziennych sytuacji
- Z perspektywy obserwatora`;

    const userPrompt = generateUserPrompt(emotions);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing emotions:', error);
    throw error;
  }
}
