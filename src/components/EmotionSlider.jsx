import React from 'react';

const EmotionSlider = ({ 
  emotion = { name: 'Emotion', plName: 'Emocja' },
  value = 5,
  onChange = () => {},
  color = '#6B7280'
}) => {
  const handleSliderChange = (e) => {
    onChange(parseInt(e.target.value));
  };

  const intensityMarks = [
    { value: 8, label: 'WYSOKI' },
    { value: 4, label: 'ŚREDNI' },
    { value: 1, label: 'NISKI' },
  ];

  const getIntensityLabel = (value) => {
    if (value >= 8) return 'WYSOKI';
    if (value >= 4) return 'ŚREDNI';
    return 'NISKI';
  };

  const isMarkActive = (markLabel, currentValue) => {
    switch (markLabel) {
      case 'WYSOKI':
        return currentValue >= 8;
      case 'ŚREDNI':
        return currentValue >= 4 && currentValue <= 7;
      case 'NISKI':
        return currentValue >= 1 && currentValue <= 3;
      default:
        return false;
    }
  };

  const emotionName = emotion?.plName || emotion?.name || 'Emocja';

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      <div className="relative h-48 flex items-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-2 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full shadow-inner" />
        </div>
        <div className="relative h-full flex items-center">
          <input
            type="range"
            min="1"
            max="10"
            value={value}
            onChange={handleSliderChange}
            className="h-48 appearance-none bg-transparent cursor-pointer"
            style={{
              writingMode: 'bt-lr',
              WebkitAppearance: 'slider-vertical',
              width: '24px',
              background: 'transparent',
            }}
            aria-label={`Poziom intensywności emocji ${emotionName}`}
            aria-valuetext={`${getIntensityLabel(value)} - ${value} na 10`}
          />
          <div className="absolute left-6 h-full flex flex-col justify-between text-xs">
            {intensityMarks.map(({ value: markValue, label }) => (
              <div
                key={markValue}
                className={`font-mono ${
                  isMarkActive(label, value) ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full text-center">
        <span
          className="text-xs sm:text-sm font-bold tracking-wider"
          style={{
            color,
            textShadow: `0 0 10px ${color}66`,
          }}
        >
          {emotionName}
        </span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="w-20 sm:w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${((value - 1) / 9) * 100}%`,
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}`,
              }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {value}/10
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmotionSlider;