import { useState, useEffect } from 'react';

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    'Analisando respostas...',
    'Selecionando trilhas...',
    'Calculando nível...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 2));
    }, 50);

    setTimeout(() => setStep(1), 1000);
    setTimeout(() => setStep(2), 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        
        <h2 className="text-2xl font-bold mb-4">Criando sua jornada personalizada...</h2>
        
        <div className="bg-gray-200 h-3 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mb-8">{Math.round(progress)}%</p>

        <div className="space-y-2 mb-8">
          {steps.map((text, i) => (
            <div key={i} className={`flex items-center justify-center gap-2 ${i <= step ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{i <= step ? '✓' : '⏳'}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-lg font-semibold mb-2">700.000+ pessoas</p>
          <p className="text-gray-600 mb-3">já escolheram Renda Extra IA</p>
          <div className="text-2xl">⭐⭐⭐⭐⭐</div>
          <p className="text-sm text-gray-500">4.8/5 (Trustpilot)</p>
        </div>
      </div>
    </div>
  );
};
