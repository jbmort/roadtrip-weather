import { HourlyData } from "./hourly-data"

export class WeatherDataType {
    hourly: HourlyData;

    constructor( hourly: {
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
    }){
      this.hourly = new HourlyData( hourly.time,
            hourly.temperature2m,
            hourly.apparentTemperature,
            hourly.precipitationProbability,
            hourly.precipitation,
            hourly.snowfall,
            hourly.weatherCode,
            hourly.cloudCover,
            hourly.windSpeed10m,
            hourly.isDay);
    }
      
    
    
}
