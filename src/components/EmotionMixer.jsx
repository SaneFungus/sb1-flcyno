import React, { useState } from 'react';
import { Activity, Shuffle, Power, Send, Loader2, Download } from 'lucide-react';
import EmotionSlider from './EmotionSlider';
import { analyzeEmotions } from '../services/openai';
import { generateCSECode } from '../services/openai';

const EmotionMixer = () => {
  const [power, setPower] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [emotionValues, setEmotionValues] = useState({});
  const [activeButton, setActiveButton] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const emotions = [
    { name: 'Joy', plName: 'Radość', code: 'JO', color: '#FFD700' },
    { name: 'Trust', plName: 'Zaufanie', code: 'TR', color: '#4CAF50' },
    { name: 'Fear', plName: 'Strach', code: 'FE', color: '#9C27B0' },
    { name: 'Surprise', plName: 'Zaskoczenie', code: 'SU', color: '#FF9800' },
    { name: 'Sadness', plName: 'Smutek', code: 'SA', color: '#2196F3' },
    { name: 'Disgust', plName: 'Odraza', code: 'DI', color: '#795548' },
    { name: 'Anger', plName: 'Gniew', code: 'AG', color: '#F44336' },
    { name: 'Anticipation', plName: 'Oczekiwanie', code: 'AN', color: '#3F51B5' }
  ];

  const handleEmotionSelect = (emotion) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
      const newValues = { ...emotionValues };
      delete newValues[emotion];
      setEmotionValues(newValues);
    } else if (selectedEmotions.length < 3) {
      setSelectedEmotions([...selectedEmotions, emotion]);
      setEmotionValues(prev => ({ ...prev, [emotion]: 5 }));
    }
  };

  const handleValueChange = (emotion, value) => {
    setEmotionValues(prev => ({ ...prev, [emotion]: value }));
  };

  const handleRandomClick = (count) => {
    setActiveButton(count);
    generateRandomEmotions(count);
  };

  const generateRandomEmotions = (count) => {
    setSelectedEmotions([]);
    setEmotionValues({});
    
    const shuffled = [...emotions]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    const newEmotions = shuffled.map(emotion => emotion.name);
    const newValues = Object.fromEntries(
      shuffled.map(emotion => [
        emotion.name,
        Math.floor(Math.random() * 10) + 1
      ])
    );
    
    setSelectedEmotions(newEmotions);
    setEmotionValues(newValues);
  };

  const getEmotionsData = () => {
    return selectedEmotions.map(emotionName => {
      const emotion = emotions.find(e => e.name === emotionName);
      return {
        code: emotion.code,
        intensity: emotionValues[emotionName]
      };
    });
  };

  const getCurrentCSECode = () => {
    if (selectedEmotions.length === 0) return 'NO INPUT';
    return generateCSECode(getEmotionsData());
  };

  const handleAnalyze = async () => {
    if (selectedEmotions.length === 0) return;

    setIsAnalyzing(true);
    try {
      const emotionsData = getEmotionsData();
      const result = await analyzeEmotions(emotionsData);
      setAnalysis(result);
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalysis('Wystąpił błąd podczas analizy emocji.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (!analysis) return;

    const emotionsData = getEmotionsData();
    const cseCode = generateCSECode(emotionsData);
    const fileName = `${cseCode}.txt`;
    
    const content = `${cseCode}\n\n${analysis}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl shadow-2xl border border-gray-700">
      <div className="flex flex-col gap-4">
        <div className="bg-black/80 rounded-lg p-3 sm:p-4 border border-gray-800 shadow-inner">
          <div className="flex items-center">
            <button
              onClick={() => setPower(!power)}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                power 
                  ? 'bg-red-500 shadow-lg shadow-red-500/50 hover:bg-red-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Power className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex-1 flex justify-center">
              <h2 className="font-mono text-xl sm:text-2xl tracking-wider whitespace-nowrap bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                EMOTION MIXER 3000
              </h2>
            </div>
          </div>
        </div>

        {power && (
          <>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4">
              {[1, 2, 3].map(count => (
                <button
                  key={count}
                  onClick={() => handleRandomClick(count)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-b from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-lg transition-all shadow-lg border border-gray-600 ${
                    activeButton === count ? 'shadow-xl shadow-blue-500/20 text-white' : 'text-gray-300'
                  }`}
                  style={{
                    boxShadow: activeButton === count 
                      ? '0 0 20px rgba(59, 130, 246, 0.4)' 
                      : undefined
                  }}
                >
                  <Shuffle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-mono text-sm sm:text-base">
                    {count} {count === 1 ? 'emocja' : 'emocje'}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 p-3 sm:p-4 bg-black/80 rounded-lg border border-gray-800 shadow-inner">
              {emotions.map(({ name, plName, color, code }) => (
                <button
                  key={name}
                  onClick={() => handleEmotionSelect(name)}
                  className={`p-2 sm:p-3 rounded-lg transition-all bg-gradient-to-b from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 ${
                    selectedEmotions.includes(name) 
                      ? 'shadow-xl shadow-blue-500/20 text-white' 
                      : 'text-gray-300'
                  }`}
                  style={{ 
                    borderLeft: `4px solid ${selectedEmotions.includes(name) ? color : 'transparent'}`,
                    opacity: selectedEmotions.includes(name) || selectedEmotions.length < 3 ? 1 : 0.5,
                    boxShadow: selectedEmotions.includes(name) 
                      ? '0 0 20px rgba(59, 130, 246, 0.4)' 
                      : undefined
                  }}
                >
                  <div className="font-mono tracking-wide text-sm sm:text-base">{plName}</div>
                  <div className="text-xs text-gray-500 font-mono">({code})</div>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 p-4 sm:p-6 bg-black/80 rounded-lg border border-gray-700 shadow-inner">
              {selectedEmotions.map(emotion => (
                <EmotionSlider
                  key={emotion}
                  emotion={emotions.find(e => e.name === emotion)}
                  value={emotionValues[emotion]}
                  onChange={(value) => handleValueChange(emotion, value)}
                  color={emotions.find(e => e.name === emotion).color}
                />
              ))}
            </div>

            <div className="bg-black/80 rounded-lg p-3 sm:p-4 border border-gray-800 shadow-inner">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 rounded font-mono border border-gray-800 flex-1">
                  <Activity className={power ? 'text-green-500' : 'text-gray-600'} />
                  <span className={`${power ? 'text-green-500' : 'text-gray-600'} min-w-[140px] text-right`}>
                    {getCurrentCSECode()}
                  </span>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || selectedEmotions.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-lg transition-all shadow-lg border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Analizuj</span>
                </button>
              </div>
            </div>

            {analysis && (
              <div className="bg-black/80 rounded-lg p-4 border border-gray-800 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold">Analiza ChatGPT:</h3>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1 bg-gradient-to-b from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-lg transition-all shadow-lg border border-gray-600"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz</span>
                  </button>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmotionMixer;