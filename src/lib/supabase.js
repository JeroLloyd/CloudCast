import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if required environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. User preferences will not be available.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Save last searched city
export async function saveLastCity(userId, cityData) {
  if (!supabase) {
    console.warn('Supabase client not initialized. Unable to save city preference.');
    return null;
  }

  try {
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
    console.error('Error saving city preference:', error);
    return null;
  }
}

// Get last searched city
export async function getLastCity(userId) {
  if (!supabase) {
    console.warn('Supabase client not initialized. Unable to get city preference.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting city preference:', error);
    return null;
  }
}