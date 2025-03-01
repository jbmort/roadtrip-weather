import { Injectable } from '@angular/core';
import { fetchWeatherApi } from 'openmeteo';
import { Observable, from } from 'rxjs';

type weatherDataType = {
  hourly: {
    time: Array<Date>,
    temperature2m: Float32Array,
    apparentTemperature: Float32Array,
    precipitationProbability: Float32Array,
    precipitation: Float32Array,
    snowfall: Float32Array,
    weatherCode: Float32Array,
    cloudCover: Float32Array,
    windSpeed10m: Float32Array,
    isDay: Float32Array,
  }
}
type pointDataType = {
  coordinate: [number, number],
  weatherData: weatherDataType
};

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  

  constructor(){
    // type weatherDataType = {
    //   hourly: {
    //     time: Array<Date>,
    //     temperature2m: Float32Array,
    //     apparentTemperature: Float32Array,
    //     precipitationProbability: Float32Array,
    //     precipitation: Float32Array,
    //     snowfall: Float32Array,
    //     weatherCode: Float32Array,
    //     cloudCover: Float32Array,
    //     windSpeed10m: Float32Array,
    //     isDay: Float32Array,
    //   }
    // }
  }

  
// get forcast data for point based on coordinate point
getForcast(lat: number, long: number): Observable<weatherDataType> {
  return from(this.forcast(lat, long));
}

private async forcast(lat: number, long: number): Promise<weatherDataType> {
	
  const params = {
    "latitude": lat
    // 41.6117
    ,
    "longitude": long 
    // -93.8852
    ,
    "hourly": ["temperature_2m", "apparent_temperature", "precipitation_probability", "precipitation", "snowfall", "weather_code", "cloud_cover", "wind_speed_10m", "is_day"],
    "temperature_unit": "fahrenheit",
    "wind_speed_unit": "mph",
    "precipitation_unit": "inch",
    "timezone": "auto",
    "forecast_days": 3
  };
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Helper function to form time ranges
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();
  const latitude = response.latitude();
  const longitude = response.longitude();

  const hourly = response.hourly()!;

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData: weatherDataType = {
    hourly: {
      time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000)
      ),
      temperature2m: hourly.variables(0)!.valuesArray()!,
      apparentTemperature: hourly.variables(1)!.valuesArray()!,
      precipitationProbability: hourly.variables(2)!.valuesArray()!,
      precipitation: hourly.variables(3)!.valuesArray()!,
      snowfall: hourly.variables(4)!.valuesArray()!,
      weatherCode: hourly.variables(5)!.valuesArray()!,
      cloudCover: hourly.variables(6)!.valuesArray()!,
      windSpeed10m: hourly.variables(7)!.valuesArray()!,
      isDay: hourly.variables(8)!.valuesArray()!,
    },

};

return weatherData;
}
}
