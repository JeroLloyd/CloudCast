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

// Get dynamic background gradient - SOFTER & GENTLER COLORS
export function getBackgroundGradient(weatherMain, isDaytime) {
  if (!isDaytime) {
    // Nighttime - Deep but gentle, less harsh
    const nightGradients = {
      Clear: 'from-slate-700 via-indigo-800 to-blue-900',
      Clouds: 'from-slate-600 via-gray-700 to-slate-800',
      Rain: 'from-slate-700 via-blue-800 to-gray-800',
      Drizzle: 'from-slate-600 via-blue-700 to-gray-700',
      Thunderstorm: 'from-slate-800 via-purple-800 to-gray-900',
      Snow: 'from-slate-600 via-blue-700 to-gray-700',
      Mist: 'from-gray-700 via-slate-700 to-blue-800',
      Smoke: 'from-slate-700 via-gray-700 to-slate-800',
      Haze: 'from-gray-700 via-slate-700 to-blue-800',
      Dust: 'from-slate-700 via-amber-900 to-gray-800',
      Fog: 'from-gray-700 via-slate-700 to-blue-800',
      Sand: 'from-slate-700 via-amber-900 to-gray-800',
      Ash: 'from-slate-800 via-gray-800 to-slate-900',
      Squall: 'from-slate-700 via-gray-800 to-slate-900',
      Tornado: 'from-slate-800 via-gray-900 to-slate-900',
      default: 'from-slate-700 via-indigo-800 to-blue-800',
    };
    
    return nightGradients[weatherMain] || nightGradients.default;
  }
  
  // Daytime - Soft pastels, easy on the eyes
  const dayGradients = {
    Clear: 'from-sky-300 via-blue-200 to-indigo-200',          // Soft sunny sky
    Clouds: 'from-slate-300 via-gray-200 to-blue-200',        // Gentle cloudy
    Rain: 'from-slate-400 via-blue-300 to-gray-300',          // Soft rainy
    Drizzle: 'from-slate-300 via-blue-200 to-gray-200',       // Light drizzle
    Thunderstorm: 'from-slate-500 via-purple-400 to-gray-400',// Gentle storm
    Snow: 'from-blue-200 via-slate-200 to-gray-100',          // Soft snowy
    Mist: 'from-gray-200 via-slate-200 to-blue-100',          // Gentle mist
    Smoke: 'from-gray-300 via-slate-300 to-amber-200',        // Soft smoky
    Haze: 'from-gray-200 via-amber-100 to-slate-200',         // Gentle haze
    Dust: 'from-amber-200 via-orange-100 to-slate-200',       // Soft dusty
    Fog: 'from-gray-200 via-slate-200 to-blue-100',           // Gentle fog
    Sand: 'from-amber-200 via-orange-200 to-slate-300',       // Soft sandy
    Ash: 'from-gray-300 via-slate-300 to-gray-400',           // Gentle ash
    Squall: 'from-slate-400 via-gray-300 to-blue-300',        // Soft windy
    Tornado: 'from-slate-500 via-gray-400 to-slate-600',      // Gentle severe
    default: 'from-blue-200 via-sky-200 to-indigo-200',       // Soft default
  };
  
  return dayGradients[weatherMain] || dayGradients.default;
}
