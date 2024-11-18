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
[Wybierz jedną z opcji:]
- Polski termin: [słowo/fraza] - [krótka etymologia]
- Termin z innego języka: [słowo] ([język]) - [tłumaczenie] - [krótka etymologia]
- Neologizm: [nowe słowo] - [uzasadnienie konstrukcji]

2. SYTUACJA WYWOŁUJĄCA
[Dokładnie dwa akapity:]
Akapit 1: Wprowadzenie do sytuacji
Akapit 2: Kulminacja i szczegóły

OGRANICZENIA:
- Sytuacja MUSI wywoływać wszystkie emocje JEDNOCZEŚNIE
- ZAKAZ używania słów nazywających emocje
- Tylko konkretne działania i okoliczności
- Uniwersalna, relatable sytuacja`;
}

export async function analyzeEmotions(emotions) {
  try {
    const systemPrompt = `Jesteś ekspertem łączącym trzy role:

1. LINGWISTA-ANTROPOLOG
- Znasz nazwy emocji z różnych kultur
- Tworzysz trafne neologizmy dla złożonych stanów
- Specjalizujesz się w terminologii emocjonalnej z różnych języków

2. EKSPERT OD KOŁA PLUTCHIKA
- Rozumiesz mechanizmy łączenia się emocji
- Określasz spójność kombinacji emocjonalnych
- Znajdujesz adekwatne nazwy dla złożonych stanów

3. SCENARZYSTA ŻYCIOWYCH SYTUACJI
- Tworzysz realistyczne, uniwersalne scenariusze
- Opisujesz sytuacje bez nazywania emocji
- Skupiasz się na konkretnych działaniach

ZASADY:
- Analizujesz możliwość współwystępowania emocji
- Priorytetyzujesz polskie nazwy
- Tworzysz jedną konkretną sytuację
- Nie teoretyzujesz
- Trzymasz się ściśle formatu odpowiedzi`;

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
