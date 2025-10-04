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

// ULTRA-DARK gradients for maximum contrast and comfort
export function getBackgroundGradient(weatherMain, isDaytime) {
  if (!isDaytime) {
    const nightGradients = {
      Clear: 'from-slate-900 via-indigo-950 to-black',
      Clouds: 'from-slate-800 via-gray-900 to-slate-950',
      Rain: 'from-slate-900 via-blue-950 to-black',
      Drizzle: 'from-slate-800 via-blue-900 to-gray-950',
      Thunderstorm: 'from-black via-purple-950 to-black',
      Snow: 'from-slate-800 via-blue-900 to-gray-950',
      Mist: 'from-gray-900 via-slate-900 to-blue-950',
      default: 'from-slate-900 via-indigo-950 to-black',
    };
    return nightGradients[weatherMain] || nightGradients.default;
  }
  
  // MUCH DARKER daytime - almost like dusk/dawn
  const dayGradients = {
    Clear: 'from-blue-600 via-blue-700 to-indigo-800',         // Dark blue
    Clouds: 'from-slate-700 via-gray-700 to-blue-800',        // Dark cloudy
    Rain: 'from-slate-800 via-blue-800 to-gray-900',          // Very dark rainy
    Drizzle: 'from-slate-700 via-blue-700 to-gray-800',       // Dark drizzle
    Thunderstorm: 'from-slate-900 via-purple-800 to-gray-900',// Almost black storm
    Snow: 'from-blue-600 via-slate-600 to-gray-500',          // Dark snowy
    Mist: 'from-gray-700 via-slate-700 to-blue-700',          // Dark misty
    default: 'from-blue-600 via-sky-700 to-indigo-800',       // Dark default
  };
  
  return dayGradients[weatherMain] || dayGradients.default;
}
