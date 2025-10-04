# CloudCast ☁️

A modern, cloud-native weather application with an Apple-inspired UI featuring glassmorphism design, real-time weather data, and persistent user preferences.

## Features

- **Live Weather Data**: Powered by OpenWeatherMap API
- **Apple-Inspired Design**: Glassmorphism UI with smooth animations
- **Smart Search**: City lookup with geolocation fallback
- **Persistent Storage**: Last searched city saved in Supabase
- **Temperature Toggle**: Switch between Celsius and Fahrenheit
- **Dynamic Backgrounds**: Changes based on weather conditions and time
- **Contextual Advice**: Smart suggestions based on current weather
- **Fully Responsive**: Optimized for all devices
- **Dark Mode**: Adapts to system preferences

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React
- **Styling**: TailwindCSS with custom glassmorphism
- **API**: Vercel Serverless Functions
- **Database**: Supabase Postgres
- **Weather Data**: OpenWeatherMap API
- **Hosting**: Vercel

## Setup Instructions

### Prerequisites
- Node.js 18+
- OpenWeatherMap API key
- Supabase account

### Installation

1. Clone repository:
```bash
git clone https://github.com/yourusername/cloudcast.git
cd cloudcast
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```bash
OPENWEATHER_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

4. Set up Supabase database (run SQL from Database Setup section)

5. Run development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Create table for storing last searched city
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  last_city TEXT NOT NULL,
  last_country TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust based on auth needs)
CREATE POLICY "Allow public access" ON user_preferences
FOR ALL USING (true);

-- Create index for faster lookups
CREATE INDEX idx_user_id ON user_preferences(user_id);
```

## Deployment

Deploy to Vercel:
```bash
vercel
```

Add environment variables in Vercel dashboard and redeploy.

## Architecture Notes

- **Serverless**: API routes run as serverless functions on Vercel Edge Network
- **Database**: Supabase provides real-time Postgres with RLS
- **Caching**: Consider adding Redis for weather data caching
- **Scaling**: Easy to swap Supabase for Neon, PlanetScale, or other providers
- **Extensibility**: Modular component structure for easy feature additions

## License

MIT
