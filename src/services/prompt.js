// Budowanie promptu, kodu CSE i wpisu archiwum.
// Plik celowo nie importuje klienta OpenAI ani zmiennych środowiskowych,
// żeby dało się go sprawdzić poza przeglądarką (node), bez klucza API.
import { primaryEmotions } from './primary-emotions-structure.js';

// Numer wersji promptu zapisywany w każdym wpisie archiwum.
// Wersja 1 = wszystkie prompty sprzed gałęzi nowy-prompt (ostatni: commit bdacd7e).
export const PROMPT_VERSION = 2;
export const MODEL = 'gpt-4';

// Impuls działania każdej emocji wg funkcji przypisanych im przez Plutchika.
// Pary przeciwne mają impulsy przeciwne (zagarnąć/puścić, zbliżyć/odepchnąć,
// uciec/natrzeć, zatrzymać się/wychylić naprzód) — na tym opiera się jednoczesność w ciele.
const IMPULSES = {
  JO: 'zagarnąć, zatrzymać, powtórzyć to, co dobre',
  SA: 'opaść, puścić, wycofać się, szukać oparcia',
  TR: 'zbliżyć się, przyjąć, dotknąć, oprzeć się',
  DI: 'odepchnąć, odsunąć, odwrócić się, wypluć',
  FE: 'uciec, schować się, zamrzeć',
  AG: 'natrzeć, uderzyć, usunąć przeszkodę',
  SU: 'zatrzymać się, przerwać ruch, rozejrzeć się',
  AN: 'wychylić się naprzód, badać, śledzić wzrokiem'
};

// Formy w narzędniku do zdań «X przeważa nad Y».
const INSTRUMENTAL = {
  JO: 'Radością',
  SA: 'Smutkiem',
  TR: 'Zaufaniem',
  DI: 'Odrazą',
  FE: 'Strachem',
  AG: 'Gniewem',
  SU: 'Zaskoczeniem',
  AN: 'Oczekiwaniem'
};

export function getIntensityLevel(value) {
  if (value <= 3) return 'L';
  if (value <= 7) return 'M';
  return 'H';
}

const pad2 = (n) => String(n).padStart(2, '0');

// Kod mieszanki, np. CSE-AN03-JO08-SA06. Emocje alfabetycznie, żeby ta sama
// mieszanka miała zawsze ten sam kod niezależnie od kolejności klikania.
export function generateCSECode(emotions) {
  const parts = [...emotions]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map(e => `${e.code}${pad2(e.intensity)}`);
  return `CSE-${parts.join('-')}`;
}

// Znacznik czasu do kodu archiwum: 20260927-1432 (czas lokalny).
export function formatTimestamp(date) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`
    + `-${pad2(date.getHours())}${pad2(date.getMinutes())}`;
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
    + ` ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// Stopień przewagi między dwiema sąsiednimi (po sile) emocjami.
export function dominanceDegree(diff) {
  if (diff === 0) return 'równowaga';
  if (diff <= 2) return 'lekka';
  return 'wyraźna';
}

// Od najsilniejszej; przy równych wartościach alfabetycznie po kodzie.
function sortByStrength(emotions) {
  return [...emotions].sort((a, b) =>
    b.intensity - a.intensity || a.code.localeCompare(b.code));
}

// Zdania o proporcjach, np. «Radość lekko przeważa nad Smutkiem (8 wobec 6)».
export function describeProportions(emotions) {
  const sorted = sortByStrength(emotions);
  const lines = [];
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1];
    const b = sorted[i];
    const nameA = primaryEmotions[a.code].translation;
    const nameB = primaryEmotions[b.code].translation;
    const degree = dominanceDegree(a.intensity - b.intensity);
    if (degree === 'równowaga') {
      lines.push(`${nameA} i ${nameB} w równowadze (${a.intensity} i ${b.intensity})`);
    } else {
      const adverb = degree === 'lekka' ? 'lekko' : 'wyraźnie';
      lines.push(`${nameA} ${adverb} przeważa nad ${INSTRUMENTAL[b.code]} (${a.intensity} wobec ${b.intensity})`);
    }
  }
  return lines;
}

const SIMULTANEITY_RULES = `
NAJWAŻNIEJSZA ZASADA — JEDNOCZESNOŚĆ
Wszystkie podane emocje występują W TEJ SAMEJ CHWILI, nie po kolei.
Emocje przeciwstawne nie znoszą się nawzajem — w życiu współistnieją.
Tak bywa np. przy śmierci bliskiej osoby, która długo cierpiała (ulga i smutek
naraz), albo gdy pociąga nas coś chorego, a zarazem przyjemnego (przyjęcie
i wstręt naraz). Nie powtarzaj tych przykładów — służą tylko do zrozumienia zasady.

JAK TO OSIĄGNĄĆ
- Wymyśl JEDNO zdarzenie, które w tej samej chwili ma dla postaci kilka znaczeń.
  Każda emocja rodzi się z innego znaczenia tego samego zdarzenia.
- Nie buduj ciągu «najpierw… potem… w końcu». Nie opisuj przełączania się stanów.
- Proporcje podane w wiadomości są wiążące: emocja dominująca prowadzi,
  słabsze są podskórne. Przy równowadze — napięcie bez zwycięzcy.
- W ciele sprzeczne emocje to sprzeczne impulsy w tym samym ciele w tej samej
  sekundzie (np. dłoń sięga, a tułów się cofa). Opisz ten konflikt jako
  konkretne zachowanie, które da się zagrać.
`;

export function buildSystemPrompt(count) {
  return `Jesteś dramaturgiem i pedagogiem aktorstwa. Piszesz krótkie zadania na etiudy
dla studentów szkoły teatralnej. Każde zadanie opiera się na mieszance 1–3
emocji z koła Plutchika. Twoje odpowiedzi trafiają do słownika złożonych emocji,
więc nazwa stanu musi być trafna i odróżniać go od podobnych mieszanek.
${count > 1 ? SIMULTANEITY_RULES : ''}
CIAŁO I SKALA
- Każda emocja jest w ciele impulsem działania (podany przy emocji).
- Siła impulsu: 1–3 ledwo widoczny, zatrzymany w zarodku; 4–7 wyraźny,
  częściowo wykonany; 8–10 trudny do opanowania.
- Skala sytuacji odpowiada natężeniom: niskie wartości to drobny, codzienny
  moment; wysokie to moment przełomowy. Nie sięgaj domyślnie po śmierć,
  chorobę ani tragedię.

JĘZYK
- Po polsku, w 3. osobie, w czasie teraźniejszym. Postać ma imię.
- Nie używaj słów nazywających emocje ani czasowników «czuje», «odczuwa»,
  «przeżywa». Pokazuj tylko to, co widać i słychać: działania, oddech,
  napięcie, tempo, przedmioty, słowa postaci.
- Nazwa stanu: słowo z innego języka podawaj tylko wtedy, gdy na pewno istnieje.
  Jeśli nie masz pewności — stwórz neologizm i oznacz go. Nie wymyślaj etymologii.
- Trzymaj się dokładnie formatu. Bez wstępów i komentarzy.`;
}

export function buildUserPrompt(emotions) {
  const sorted = sortByStrength(emotions);
  const multi = emotions.length > 1;

  const emotionLines = sorted.map(e => {
    const emotion = primaryEmotions[e.code];
    const variant = emotion.variants[getIntensityLevel(e.intensity)];
    return `- ${emotion.translation} ${e.intensity}/10 → odcień: ${variant.translation}. Impuls: ${IMPULSES[e.code]}.`;
  }).join('\n');

  const forbidden = new Set();
  sorted.forEach(e => {
    const emotion = primaryEmotions[e.code];
    forbidden.add(emotion.translation.toLowerCase());
    Object.values(emotion.variants).forEach(v => forbidden.add(v.translation.toLowerCase()));
  });
  ['emocja', 'uczucie', 'czuć'].forEach(w => forbidden.add(w));

  const proportions = multi
    ? `\nPROPORCJE:\n${describeProportions(emotions).map(l => `- ${l}`).join('\n')}\n`
    : '';

  const meaningSection = multi
    ? `4. JEDNO ZDARZENIE, KILKA ZNACZEŃ
Po jednej linijce na każdą emocję: co to samo zdarzenie oznacza dla postaci —
jako myśl lub fakt, bez nazywania emocji.
(np. «Dostała się na wymarzone studia.» / «Wyjedzie z domu, w którym zostaje chory ojciec.»)`
    : `4. ZNACZENIE
Jedna linijka: co to zdarzenie oznacza dla postaci — jako myśl lub fakt, bez nazywania emocji.`;

  const bodySection = multi
    ? `2–4 zdania: jak wszystkie impulsy są obecne w ciele naraz — konkretne działania,
oddech, napięcie, przedmiot w dłoni. Zaznacz, który impuls dominuje.`
    : `2–4 zdania: jak impuls jest obecny w ciele — konkretne działania,
oddech, napięcie, przedmiot w dłoni.`;

  return `KOD: ${generateCSECode(emotions)}

EMOCJE (od najsilniejszej):
${emotionLines}
${proportions}
ZAKAZANE SŁOWA: ${[...forbidden].join(', ')}
(oraz ich odmiany i bliskie synonimy).

FORMAT ODPOWIEDZI:

1. NAZWA
[nazwa] ([polskie słowo] / [język: …, znaczenie: …] / [neologizm]) — wybierz jeden typ.
Jedno zdanie, max 12 słów: czym jest ten stan, bez zakazanych słów.

2. ZDARZENIE
Jedno zdanie: co dokładnie dzieje się w tej jednej chwili.

3. OKOLICZNOŚCI
2–3 zdania: gdzie, kiedy, kto jest obecny, co wydarzyło się tuż przed.

${meaningSection}

5. CIAŁO
${bodySection}

6. ZADANIE DLA AKTORA
Jedno zdanie zaczynające się od czasownika: co aktor robi i jaki moment ma utrzymać.`;
}

// Pełny wpis archiwum — sam się opisuje, żeby z plików dało się później
// zbudować słownik bez zaglądania do aplikacji.
export function buildArchiveEntry({ emotions, date, analysis }) {
  const code = `${generateCSECode(emotions)}-${formatTimestamp(date)}`;
  const sorted = sortByStrength(emotions);
  const width = Math.max(...sorted.map(e => primaryEmotions[e.code].translation.length));

  const mixLines = sorted.map(e => {
    const emotion = primaryEmotions[e.code];
    const variant = emotion.variants[getIntensityLevel(e.intensity)];
    return `  ${emotion.translation.padEnd(width)}  ${String(e.intensity).padStart(2)}/10  (odcień: ${variant.translation})`;
  }).join('\n');

  const proportions = emotions.length > 1
    ? `Proporcje:\n${describeProportions(emotions).map(l => `  ${l}`).join('\n')}\n`
    : '';

  const text = `${code}
Data: ${formatDate(date)}
Mieszanka (od najsilniejszej):
${mixLines}
${proportions}Model: ${MODEL} · Wersja promptu: ${PROMPT_VERSION}

${analysis}
`;

  return { code, text };
}
