import axios from 'axios';

// OpenWeatherMap API configuration
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    cloudCover: number;
    visibility: number;
    uvIndex: number;
    description: string;
    icon: string;
    condition: string;
    lightIntensity: number; // Calculated based on cloud cover and time
  };
  forecast: Array<{
    date: string;
    day: string;
    temp: {
      min: number;
      max: number;
    };
    humidity: number;
    description: string;
    icon: string;
    condition: string;
    precipitation: number;
  }>;
}

// Mock weather data for demo purposes (fallback when API key is not available)
const mockWeatherData: WeatherData = {
  current: {
    temp: 28,
    humidity: 65,
    pressure: 1013,
    windSpeed: 12,
    windDirection: 180,
    cloudCover: 20,
    visibility: 10,
    uvIndex: 6,
    description: 'Partly cloudy',
    icon: '02d',
    condition: 'partly-cloudy',
    lightIntensity: 850
  },
  forecast: [
    {
      date: '2025-07-25',
      day: 'Tomorrow',
      temp: { min: 22, max: 30 },
      humidity: 70,
      description: 'Light rain',
      icon: '10d',
      condition: 'rainy',
      precipitation: 60
    },
    {
      date: '2025-07-26',
      day: 'Saturday',
      temp: { min: 24, max: 32 },
      humidity: 55,
      description: 'Sunny',
      icon: '01d',
      condition: 'sunny',
      precipitation: 0
    },
    {
      date: '2025-07-27',
      day: 'Sunday',
      temp: { min: 26, max: 35 },
      humidity: 45,
      description: 'Hot and sunny',
      icon: '01d',
      condition: 'sunny',
      precipitation: 0
    },
    {
      date: '2025-07-28',
      day: 'Monday',
      temp: { min: 23, max: 29 },
      humidity: 75,
      description: 'Thunderstorms',
      icon: '11d',
      condition: 'stormy',
      precipitation: 85
    },
    {
      date: '2025-07-29',
      day: 'Tuesday',
      temp: { min: 25, max: 31 },
      humidity: 60,
      description: 'Partly cloudy',
      icon: '02d',
      condition: 'partly-cloudy',
      precipitation: 10
    },
    {
      date: '2025-07-30',
      day: 'Wednesday',
      temp: { min: 27, max: 33 },
      humidity: 50,
      description: 'Clear sky',
      icon: '01d',
      condition: 'sunny',
      precipitation: 0
    },
    {
      date: '2025-07-31',
      day: 'Thursday',
      temp: { min: 24, max: 30 },
      humidity: 68,
      description: 'Cloudy',
      icon: '03d',
      condition: 'cloudy',
      precipitation: 20
    }
  ]
};

const calculateLightIntensity = (cloudCover: number, hour: number): number => {
  // Base light intensity varies by time of day
  const timeMultiplier = hour >= 6 && hour <= 18 ? 1 : 0.1;
  const cloudMultiplier = (100 - cloudCover) / 100;
  return Math.round(1000 * timeMultiplier * cloudMultiplier);
};

const mapWeatherCondition = (icon: string): string => {
  const iconMap: Record<string, string> = {
    '01d': 'sunny',
    '01n': 'clear',
    '02d': 'partly-cloudy',
    '02n': 'partly-cloudy',
    '03d': 'cloudy',
    '03n': 'cloudy',
    '04d': 'overcast',
    '04n': 'overcast',
    '09d': 'rainy',
    '09n': 'rainy',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'stormy',
    '11n': 'stormy',
    '13d': 'snowy',
    '13n': 'snowy',
    '50d': 'foggy',
    '50n': 'foggy'
  };
  return iconMap[icon] || 'partly-cloudy';
};

export const fetchWeatherData = async (lat: number = 12.9716, lon: number = 77.5946): Promise<WeatherData> => {
  try {
    // Check if API key is the placeholder and throw an error if it is.
    if (API_KEY === "YOUR_API_KEY_HERE" || API_KEY === "demo") {
      throw new Error("Please configure your OpenWeatherMap API key. Get it from https://openweathermap.org/api");
    }

    // Fetch current weather
    const currentResponse = await axios.get(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    // Fetch 7-day forecast
    const forecastResponse = await axios.get(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const current = currentResponse.data;
    const forecast = forecastResponse.data;

    const currentHour = new Date().getHours();
    const lightIntensity = calculateLightIntensity(current.clouds.all, currentHour);

    const weatherData: WeatherData = {
      current: {
        temp: Math.round(current.main.temp),
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        windSpeed: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: current.wind.deg || 0,
        cloudCover: current.clouds.all,
        visibility: current.visibility / 1000, // Convert to km
        uvIndex: 0, // Not available in free tier
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        condition: mapWeatherCondition(current.weather[0].icon),
        lightIntensity
      },
      forecast: forecast.list
        .filter((_: any, index: number) => index % 8 === 0) // Get daily forecasts (every 8th item = daily)
        .slice(1, 8) // Skip today, get next 7 days
        .map((item: any, index: number) => {
          const date = new Date(item.dt * 1000);
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          
          return {
            date: date.toISOString().split('T')[0],
            day: index === 0 ? 'Tomorrow' : days[date.getDay()],
            temp: {
              min: Math.round(item.main.temp_min),
              max: Math.round(item.main.temp_max)
            },
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            condition: mapWeatherCondition(item.weather[0].icon),
            precipitation: item.pop * 100 // Convert to percentage
          };
        })
    };

    return weatherData;
  } catch (error) {
    console.warn('Weather API error, using mock data:', error);
    return mockWeatherData;
  }
};