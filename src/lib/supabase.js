import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if required environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. User preferences will not be available.');
}

let supabaseInstance = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public'
      }
    });
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  supabaseInstance = null;
}

export const supabase = supabaseInstance;

// Helper function to check connection
async function checkSupabaseConnection() {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('user_preferences').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    return false;
  }
}

// Helper function to store data in localStorage as fallback
function storeLocalPreference(userId, cityData) {
  try {
    localStorage.setItem(`cloudcast_preference_${userId}`, JSON.stringify({
      ...cityData,
      timestamp: Date.now()
    }));
    return true;
  } catch (e) {
    return false;
  }
}

// Helper function to get data from localStorage as fallback
function getLocalPreference(userId) {
  try {
    const data = localStorage.getItem(`cloudcast_preference_${userId}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

// Save last searched city
export async function saveLastCity(userId, cityData) {
  // Always save to localStorage as fallback
  storeLocalPreference(userId, cityData);

  if (!supabase) {
    console.warn('Supabase client not initialized. Using local storage only.');
    return null;
  }

  // Try Supabase with retry logic
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.warn('Supabase connection failed. Using local storage.');
        return null;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          last_city: cityData.name,
          last_country: cityData.country,
          latitude: cityData.lat,
          longitude: cityData.lon,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error saving city preference (attempt ${attempt + 1}/3):`, error);
      if (attempt === 2) return null; // Last attempt failed
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
    }
  }
  return null;
}

// Get last searched city
export async function getLastCity(userId) {
  // First try to get from localStorage
  const localData = getLocalPreference(userId);
  
  if (!supabase) {
    console.warn('Supabase client not initialized. Using local storage only.');
    return localData;
  }

  // Try Supabase with retry logic
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.warn('Supabase connection failed. Using local storage.');
        return localData;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return localData; // Record not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error(`Error getting city preference (attempt ${attempt + 1}/3):`, error);
      if (attempt === 2) return localData; // Last attempt failed, use local data
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
    }
  }
  return localData;
}