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

  const emotionRequirements = emotions.map(e => {
    const emotion = primaryEmotions[e.code];
    const level = getIntensityLevel(e.intensity);
    const variant = emotion.variants[level];
    return `- ${emotion.translation} (${level}): musi być widoczna w fizycznych reakcjach i kontekście na poziomie ${variant.translation}`;
  }).join('\n');

  return `Przeanalizuj poniższy złożony stan emocjonalny.

KOD: ${cseCode}
KOMBINACJA: ${emotionsList}

WYMAGANY FORMAT ODPOWIEDZI:

1. NAZWA ZŁOŻONEJ EMOCJI
[Wybierz JEDNĄ opcję. Max 12 słów wyjaśnienia:]
a) Polski termin: [istniejące słowo] - [zwięzły opis stanu BEZ NAZYWANIA EMOCJI]
b) Termin z innego języka: [krótkie słowo] ([język]) - [tłumaczenie] - [zwięzły opis stanu BEZ NAZYWANIA EMOCJI]
c) Neologizm: [proste, max 3-sylabowe słowo] - [zwięzły opis stanu BEZ NAZYWANIA EMOCJI]

2. SYTUACJA WYWOŁUJĄCA
[Opisz REALNĄ sytuację z CODZIENNEGO życia. Każda emocja musi być widoczna w odpowiednim natężeniu.]

Akapit 1: [max 3 zdania]
- Miejsce: konkretna, codzienna lokalizacja
- Czas: konkretna pora dnia
- Kontekst: zwyczajna sytuacja życiowa
- Źródło każdej z emocji musi być jasno widoczne

Akapit 2: [max 3 zdania]
- Fizyczne przejawy KAŻDEJ z emocji
- Reakcje odpowiadające poziomowi intensywności
- Konkretne szczegóły z otoczenia
- Wyłącznie realne elementy sytuacji

WYMAGANE ELEMENTY DLA KAŻDEJ EMOCJI:
${emotionRequirements}

ZABRONIONE:
- Fantastyczne lub nierealistyczne elementy
- Słowa opisujące emocje lub stany psychiczne
- Metafory i porównania
- Sekwencje zdarzeń
- Wewnętrzne monologi
- Określenia oceniające

WYMAGANE:
- Codzienna, rzeczywista sytuacja
- Konkretne fizyczne szczegóły
- Uniwersalne doświadczenie
- Neutralność płciowa
- Jednoczesność wszystkich emocji
- Wyraźne pokazanie intensywności każdej emocji`;
}

export async function analyzeEmotions(emotions) {
  try {
    const systemPrompt = `Jesteś ekspertem tworzącym opisy złożonych stanów emocjonalnych dla CODZIENNYCH sytuacji życiowych.

TWOJE KOMPETENCJE:
1. Znajdowanie prostych nazw dla skomplikowanych stanów
2. Tworzenie realistycznych scenariuszy z życia
3. Opisywanie fizycznych reakcji i szczegółów

TWOJE PRIORYTETY:
1. Realizm sytuacji
2. Uniwersalność doświadczenia
3. Konkretność szczegółów
4. Prostota języka

TWÓJ STYL:
1. Używasz prostych, krótkich zdań
2. Skupiasz się na fizycznych szczegółach
3. Opisujesz konkretne działania
4. Unikasz abstrakcji i metafor

NAJWAŻNIEJSZE ZASADY:
1. Każda sytuacja MUSI być z codziennego życia
2. Wszystkie emocje występują JEDNOCZEŚNIE
3. Zero fantastyki i nierealnych elementów
4. Żadnych słów opisujących emocje`;

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
