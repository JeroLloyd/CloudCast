// Generate unique user ID (stored in localStorage)
export function getUserId() {
  if (typeof window === 'undefined') return null;
  
  let userId = localStorage.getItem('cloudcast_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cloudcast_user_id', userId);
  }
  return userId;
}

// Get contextual weather advice
export function getWeatherAdvice(weatherMain, temp) {
  const tempCelsius = temp - 273.15;
  
  const adviceMap = {
    Clear: tempCelsius > 25 ? "Perfect day for outdoor activities!" : "Beautiful clear skies today",
    Clouds: "Partly cloudy — great for a walk",
    Rain: "Bring an umbrella — rain expected",
    Drizzle: "Light rain — a light jacket recommended",
    Thunderstorm: "Stay indoors — thunderstorms nearby",
    Snow: "Bundle up — snow conditions",
    Mist: "Reduced visibility — drive carefully",
    Smoke: "Air quality may be poor",
    Haze: "Hazy conditions — limit outdoor exposure",
    Dust: "Dusty air — consider wearing a mask",
    Fog: "Foggy weather — be cautious",
    Sand: "Sandy conditions — protect your eyes",
    Ash: "Volcanic ash — stay indoors",
    Squall: "Strong winds expected",
    Tornado: "Severe weather alert — take shelter",
  };
  
  return adviceMap[weatherMain] || "Check the forecast before heading out";
}

// Get dynamic background gradient based on weather and time
export function getBackgroundGradient(weatherMain, isDaytime) {
  if (!isDaytime) {
    return 'from-slate-900 via-purple-900 to-slate-900';
  }
  
  const gradients = {
    Clear: 'from-blue-400 via-cyan-300 to-blue-500',
    Clouds: 'from-gray-400 via-gray-300 to-gray-500',
    Rain: 'from-slate-600 via-blue-700 to-slate-800',
    Drizzle: 'from-slate-500 via-blue-600 to-slate-700',
    Thunderstorm: 'from-gray-800 via-purple-900 to-gray-900',
    Snow: 'from-blue-100 via-slate-200 to-blue-200',
    Mist: 'from-gray-300 via-slate-400 to-gray-400',
    default: 'from-blue-400 via-indigo-400 to-purple-500',
  };
  
  return gradients[weatherMain] || gradients.default;
}