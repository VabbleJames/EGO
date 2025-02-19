import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onLoadingComplete = () => {} }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [binaryText, setBinaryText] = useState('111000 $100 110011');
  const [message, setMessage] = useState('Calibrating.');

  const messages = [
    "Welcome to EGO",
    "The future of prediction markets & AI.",
    "EGO coming online..."
  ];

  const updateBinaryCode = () => {
    const binaryValues = ['010101', '101010', '110011', '011010', '100110', '111000'];
    const dollarValues = ['$100', '$1000', '$100000'];
    const combinedValues = [...binaryValues, ...dollarValues];
    const randomValue = combinedValues[Math.floor(Math.random() * combinedValues.length)];
    return randomValue.includes('$') ? 
      <span className="text-green-500">{randomValue}</span> : 
      randomValue;
  };

  useEffect(() => {
    const totalLoadTime = 8000;
    const interval = totalLoadTime / 100;
    let timer;

    const incrementProgress = () => {
      setProgress(prev => {
        if (prev >= 100) {
          clearTimeout(timer);
          setOpacity(0);
          setTimeout(() => {
            setIsVisible(false);
            onLoadingComplete();
          }, 1000);
          return prev;
        }

        if (prev === 1) setMessage(messages[0]);
        if (prev === 34) setMessage(messages[1]);
        if (prev === 67) setMessage(messages[2]);

        setBinaryText([updateBinaryCode(), ' ', updateBinaryCode(), ' ', updateBinaryCode()]);
        return prev + 1;
      });
    };

    timer = setInterval(incrementProgress, interval);
    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-1000"
      style={{ opacity }}
    >
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="w-full h-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
        >
          <source 
            src="/video/background.mp4" 
            type="video/mp4"
          />
        </video>
      </div>

      {/* Content Overlay */}
      <div className="text-center relative z-10">
        {/* Title Text */}
        <div 
          className="text-2xl uppercase tracking-wider mb-8 transition-opacity duration-500"
          style={{
            opacity: 1,
            background: 'linear-gradient(to right, rgba(0,0,0,0) -25%,rgb(245, 243, 243) 40%, rgba(191,191,191) 60%, rgba(0,0,0,0) 125%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {message}
        </div>

        {/* Gradient Line */}
        <div className="flex justify-center mb-8">
          <div 
            style={{
              width: '850px',
              height: '7px',
              background: 'linear-gradient(90deg, rgba(0,0,0,0), #ea8051 20%, #ee1e95 50%, #5d1b9a 80%, rgba(0,0,0,0))',
              borderRadius: '3.5px'
            }}
          />
        </div>

        {/* Binary Code */}
        <div className="text-white text-base whitespace-nowrap opacity-100">
          {binaryText}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;