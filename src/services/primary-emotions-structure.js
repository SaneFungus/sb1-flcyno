// primary-emotions-structure.js

const INTENSITY_RANGES = {
  'L': { min: 1, max: 3, name: 'Low' },
  'M': { min: 4, max: 7, name: 'Medium' },
  'H': { min: 8, max: 10, name: 'High' }
};

export const primaryEmotions = {
  'AN': {
    name: 'Anticipation',
    translation: 'Oczekiwanie',
    variants: {
      'L': { name: 'Interest', translation: 'Zainteresowanie' },
      'M': { name: 'Anticipation', translation: 'Oczekiwanie' },
      'H': { name: 'Vigilance', translation: 'Czujność' }
    }
  },
  'JO': {
    name: 'Joy',
    translation: 'Radość',
    variants: {
      'L': { name: 'Serenity', translation: 'Spokój' },
      'M': { name: 'Joy', translation: 'Radość' },
      'H': { name: 'Ecstasy', translation: 'Ekstaza' }
    }
  },
  'TR': {
    name: 'Trust',
    translation: 'Zaufanie',
    variants: {
      'L': { name: 'Acceptance', translation: 'Akceptacja' },
      'M': { name: 'Trust', translation: 'Zaufanie' },
      'H': { name: 'Admiration', translation: 'Podziw' }
    }
  },
  'FE': {
    name: 'Fear',
    translation: 'Strach',
    variants: {
      'L': { name: 'Apprehension', translation: 'Obawa' },
      'M': { name: 'Fear', translation: 'Strach' },
      'H': { name: 'Terror', translation: 'Przerażenie' }
    }
  },
  'SU': {
    name: 'Surprise',
    translation: 'Zaskoczenie',
    variants: {
      'L': { name: 'Distraction', translation: 'Rozproszenie' },
      'M': { name: 'Surprise', translation: 'Zaskoczenie' },
      'H': { name: 'Amazement', translation: 'Zdumienie' }
    }
  },
  'SA': {
    name: 'Sadness',
    translation: 'Smutek',
    variants: {
      'L': { name: 'Pensiveness', translation: 'Zaduma' },
      'M': { name: 'Sadness', translation: 'Smutek' },
      'H': { name: 'Grief', translation: 'Żal' }
    }
  },
  'DI': {
    name: 'Disgust',
    translation: 'Odraza',
    variants: {
      'L': { name: 'Boredom', translation: 'Znudzenie' },
      'M': { name: 'Disgust', translation: 'Odraza' },
      'H': { name: 'Loathing', translation: 'Wstręt' }
    }
  },
  'AG': {
    name: 'Anger',
    translation: 'Gniew',
    variants: {
      'L': { name: 'Annoyance', translation: 'Irytacja' },
      'M': { name: 'Anger', translation: 'Gniew' },
      'H': { name: 'Rage', translation: 'Wściekłość' }
    }
  }
};

function getIntensityLevel(value) {
  if (value <= 3) return 'L';
  if (value <= 7) return 'M';
  return 'H';
}

export function getEmotionVariantByIntensity(emotionCode, intensityValue) {
  const level = getIntensityLevel(intensityValue);
  return primaryEmotions[emotionCode]?.variants[level];
}

export function generateEmotionalMixtureName(emotions) {
  return emotions.map(e => {
    const emotion = primaryEmotions[e.code];
    const variant = getEmotionVariantByIntensity(e.code, e.intensity);
    return `${emotion.translation} (${e.intensity}) = ${variant.translation}`;
  }).join(' + ');
}

export function getAllEmotionsWithTranslations() {
  return Object.entries(primaryEmotions).map(([code, emotion]) => ({
    code,
    name: emotion.name,
    translation: emotion.translation,
    variants: Object.entries(emotion.variants).map(([level, variant]) => ({
      level,
      name: variant.name,
      translation: variant.translation,
      intensityRange: INTENSITY_RANGES[level]
    }))
  }));
}

// Helper function to get emotion translation
export function getEmotionTranslation(emotionCode) {
  return primaryEmotions[emotionCode]?.translation;
}
