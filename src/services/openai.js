import OpenAI from 'openai';
import { primaryEmotions } from './primary-emotions-structure';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export function generateCSECode(emotions) {
  const emotionCodes = emotions
    .map(e => e.code)
    .sort()
    .join('.');
    
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

function generateUserPrompt(emotions) {
  const cseCode = generateCSECode(emotions);
  const emotionsList = emotions.map(e => {
    const emotion = primaryEmotions[e.code];
    const level = getIntensityLevel(e.intensity);
    const variant = emotion.variants[level];
    return `${emotion.translation} (${e.intensity}/10) = ${variant.translation}`;
  }).join(' + ');

  return `Przeanalizuj poniższy złożony stan emocjonalny.

KOD: ${cseCode}
KOMBINACJA: ${emotionsList}

WYMAGANY FORMAT ODPOWIEDZI:

1. NAZWA ZŁOŻONEJ EMOCJI
[Wybierz jedną opcję i podaj maksymalnie 2 krótkie zdania wyjaśnienia:]
a) Polski termin: [słowo] - [krótkie wyjaśnienie BEZ NAZYWANIA EMOCJI]
b) Termin z innego języka: [słowo] ([język]) - [tłumaczenie] - [krótkie wyjaśnienie BEZ NAZYWANIA EMOCJI]
c) Neologizm: [nowe słowo] - [krótkie wyjaśnienie konstrukcji BEZ NAZYWANIA EMOCJI]

2. SYTUACJA WYWOŁUJĄCA
[Opisz JEDEN KONKRETNY MOMENT, nie sekwencję zdarzeń. Wszystkie emocje muszą występować dokładnie w tej samej chwili.]

Akapit 1: Opis miejsca i okoliczności (max 3 zdania)
Akapit 2: Opis kulminacyjnego momentu, w którym wszystkie emocje występują jednocześnie (max 3 zdania)

OGRANICZENIA:
- ZAKAZ używania słów opisujących emocje
- ZAKAZ opisywania sekwencji zdarzeń - skup się na JEDNYM momencie
- Użyj neutralnych płciowo określeń (np. "osoba", "człowiek")
- Sytuacja musi być uniwersalna - każdy może się w niej znaleźć
- Opisuj tylko konkretne działania, reakcje fizyczne i okoliczności
- Wszystkie emocje MUSZĄ występować JEDNOCZEŚNIE, nie jedna po drugiej`;
}

export async function analyzeEmotions(emotions) {
  try {
    const systemPrompt = `Jesteś ekspertem łączącym trzy role:

1. LINGWISTA-ANTROPOLOG
- Znajdujesz lub tworzysz precyzyjne nazwy dla złożonych stanów emocjonalnych
- Unikasz rozwlekłych wyjaśnień etymologicznych
- Koncentrujesz się na obrazowym opisie znaczenia

2. EKSPERT OD KOŁA PLUTCHIKA
- Specjalizujesz się w stanach, gdzie kilka emocji występuje JEDNOCZEŚNIE
- Potrafisz określić, czy dana kombinacja może wystąpić w jednym momencie
- Jeśli kombinacja nie może wystąpić jednocześnie, modyfikujesz zadanie

3. MISTRZ ZWIĘZŁEGO OPISU
- Tworzysz uniwersalne, neutralne płciowo scenariusze
- Skupiasz się na jednym konkretnym momencie
- Opisujesz sytuacje przez pryzmat działań i reakcji fizycznych

NAJWAŻNIEJSZE ZASADY:
1. Nie używaj słów nazywających emocje
2. Skupiaj się na JEDNYM momencie, nie na sekwencji zdarzeń
3. Wszystkie emocje muszą występować JEDNOCZEŚNIE
4. Twórz opisy uniwersalne - każdy może się w nich znaleźć
5. Używaj konkretnych, fizycznych szczegółów
6. Bądź zwięzły i precyzyjny`;

    const userPrompt = generateUserPrompt(emotions);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
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
