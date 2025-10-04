import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Save last searched city
export async function saveLastCity(userId, cityData) {
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
}

// Get last searched city
export async function getLastCity(userId) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}