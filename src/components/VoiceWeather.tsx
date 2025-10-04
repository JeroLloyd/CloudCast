'use client';
import { useState } from 'react';
import { MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

export default function VoiceWeather({ weather, unit }: { weather: any, unit: string }) {
  const [isListening, setIsListening] = useState(false);
  const [response, setResponse] = useState('');

  const temp = unit === 'C' 
    ? Math.round(weather.main.temp - 273.15) 
    : Math.round((weather.main.temp - 273.15) * 9/5 + 32);

  const speakWeather = () => {
    if ('speechSynthesis' in window) {
      const text = `The weather in ${weather.name} is ${weather.weather[0].description}. The temperature is ${temp} degrees ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}. Humidity is ${weather.main.humidity} percent.`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
      
      setResponse(text);
    } else {
      setResponse('Speech synthesis not supported in your browser.');
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
      };
      
      recognition.start();
    } else {
      setResponse('Speech recognition not supported in your browser.');
    }
  };

  const handleVoiceCommand = (command: string) => {
    if (command.includes('weather') || command.includes('temperature')) {
      speakWeather();
    } else if (command.includes('rain')) {
      const hasRain = weather.weather[0].main.toLowerCase().includes('rain');
      const text = hasRain ? 'Yes, it is raining.' : 'No, it is not raining.';
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      setResponse(text);
    } else {
      setResponse(`Command not recognized: "${command}"`);
    }
  };

  return (
    <div className="backdrop-blur-2xl bg-white/18 rounded-2xl p-3 border border-white/30">
      <h3 className="text-white font-light text-sm mb-3">🎤 Voice Assistant</h3>

      <div className="flex gap-2 mb-3">
        <button
          onClick={speakWeather}
          className="flex-1 py-2 px-3 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 text-white text-sm flex items-center justify-center gap-2 transition-all"
        >
          <SpeakerWaveIcon className="w-4 h-4" />
          Speak Weather
        </button>
        
        <button
          onClick={startListening}
          disabled={isListening}
          className={`flex-1 py-2 px-3 rounded-lg text-white text-sm flex items-center justify-center gap-2 transition-all ${
            isListening 
              ? 'bg-red-500/30 animate-pulse' 
              : 'bg-green-500/30 hover:bg-green-500/50'
          }`}
        >
          <MicrophoneIcon className="w-4 h-4" />
          {isListening ? 'Listening...' : 'Ask'}
        </button>
      </div>

      {response && (
        <div className="backdrop-blur-lg bg-white/15 rounded-lg p-3">
          <p className="text-white text-xs leading-relaxed">{response}</p>
        </div>
      )}

      <p className="text-white/50 text-xs mt-2">
        Try: "What's the weather?" or "Will it rain?"
      </p>
    </div>
  );
}
