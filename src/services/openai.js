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

  return `Jesteś doświadczonym trenerem aktorów specjalizującym się w pracy z emocjami. Przeanalizuj poniższy złożony stan emocjonalny, skupiając się na praktycznych wskazówkach do pracy aktorskiej. Użyj podanego formatu.

# ${cseCode}

## Polskie tłumaczenie
${emotionsList}

## Esencja stanu
[Opisz w 2-3 zdaniach esencję tego stanu emocjonalnego, jego dynamikę i główną charakterystykę. Użyj języka zrozumiałego dla aktora.]

## Główne cechy do zagrania
### Ciało
[Lista 5-6 konkretnych wskazówek dotyczących:
- postawy ciała
- napięcia mięśniowego
- charakterystycznych gestów
- sposobu poruszania się
- pozycji rąk i nóg]

### Twarz
[Lista 4-5 szczegółowych wskazówek dotyczących:
- wyrazu oczu
- układu ust
- napięcia szczęki
- zmarszczek i brwi
- ogólnego wyrazu twarzy]

### Głos
[Lista 5-6 konkretnych wskazówek dotyczących:
- barwy głosu
- tempa mówienia
- rytmu wypowiedzi
- charakterystycznych pauz
- natężenia głosu
- specyficznych cech wypowiedzi]

## Porównania sceniczne
[Wymień 4 konkretne sceny z filmów lub sztuk teatralnych gdzie pojawia się podobny stan emocjonalny. Dla każdej sceny podaj:
- tytuł dzieła
- nazwisko aktora/aktorki
- krótki opis momentu
- co szczególnie warto zaobserwować]

## Przykłady scen do zagrania
[Opisz 4 różne sceny, które aktor może wykorzystać do ćwiczenia tego stanu emocjonalnego. Dla każdej sceny podaj:
- sytuację początkową
- kontekst
- możliwy rozwój sceny
- punkt kulminacyjny]

## Wskazówki do improwizacji
### Krok 1: Przygotowanie fizyczne
[3-4 konkretne ćwiczenia rozgrzewające ciało pod kątem tego stanu emocjonalnego, z opisem jak je wykonać]

### Krok 2: Przygotowanie głosowe
[3-4 konkretne ćwiczenia rozgrzewające głos, z opisem jak je wykonać]

### Krok 3: Budowanie stanu
[4-5 kroków jak stopniowo budować ten stan emocjonalny, zaczynając od najprostszych elementów]

### Krok 4: Rozwijanie improwizacji
[4-5 konkretnych wskazówek jak rozwijać i pogłębiać stan w trakcie improwizacji]

### Krok 5: Bezpieczne wyjście
[3-4 konkretne techniki pozwalające bezpiecznie wyjść ze stanu po zakończeniu improwizacji]`;
}

export async function analyzeEmotions(emotions) {
  try {
    const systemPrompt = `Jesteś doświadczonym coachem aktorskim specjalizującym się w pracy z emocjami. 
Twoje odpowiedzi są zawsze:
- Konkretne i praktyczne
- Oparte na fizycznych aspektach aktorstwa
- Napisane językiem zrozumiałym dla aktora
- Możliwe do zastosowania w praktyce
- Bezpieczne dla zdrowia psychicznego aktora

Unikaj:
- Ogólników i teoretyzowania
- Zbyt technicznych terminów psychologicznych
- Niebezpiecznych lub szkodliwych technik
- Wskazówek niemożliwych do wykonania fizycznie`;

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
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing emotions:', error);
    throw error;
  }
}