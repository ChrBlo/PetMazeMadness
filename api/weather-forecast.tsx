import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WeatherData {
  temperature: number;
  icon: string;
  symbolCode: string;
}

interface WeatherForecasterProps {
  onWeatherUpdate?: (symbolCode: string | null) => void;
}

export const WeatherForecaster: React.FC<WeatherForecasterProps> = ({ onWeatherUpdate }) => {

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Borås coordinates
  const lat = 57.7210;
  const lon = 12.9401;

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try
    {
      const response = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'PetMazeMadness/1.0 (cebafros@hotmail.com)'
          }
        }
      );
      const data = await response.json();
      
      const current = data.properties.timeseries[0];
      const temp = current.data.instant.details.air_temperature;
      const symbolCode = current.data.next_1_hours?.summary.symbol_code || 'clearsky_day';
      
      setWeather({
        temperature: Math.round(temp),
        icon: getWeatherIcon(symbolCode),
        symbolCode: symbolCode
      });

      onWeatherUpdate?.(symbolCode);
    }
    catch (error)
    {
      console.log('Weather fetch error:', error);
    }
    finally
    {
      setLoading(false);
    }
  };

  const getWeatherIcon = (symbolCode: string) => {
    const icons: { [key: string]: string } = {
      'clearsky_day': '☀️',
      'clearsky_night': '🌙',
      'fair_day': '🌤️',
      'fair_night': '🌙',
      'partlycloudy_day': '⛅',
      'partlycloudy_night': '☁️',
      'cloudy': '☁️',
      'rain': '🌧️',
      'rainshowers_day': '🌦️',
      'rainshowers_night': '🌧️',
      'snow': '❄️',
      'snowshowers_day': '🌨️',
      'thunderstorm': '⛈️',
      'fog': '🌫️'
    };
    
    for (const [key, emoji] of Object.entries(icons))
    {
      if (symbolCode.includes(key.split('_')[0]))
      {
        return emoji;
      }
    }
    
    return '🌤️';
  };

  if (loading) return <Text style={styles.loading}>⏳</Text>;
  if (!weather) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{weather.icon}</Text>
      <Text style={styles.temp}>{weather.temperature}°</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'center',
    backgroundColor: '#221c17ff',
  },
  icon: {
    fontSize: 20,
  },
  temp: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loading: {
    color: 'white',
    fontSize: 12,
  },
});