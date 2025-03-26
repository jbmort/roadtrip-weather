export class HourlyData {
    time: Array<Date>;
    temperature2m: Float32Array;
    apparentTemperature: Float32Array;
    precipitationProbability: Float32Array;
    precipitation: Float32Array;
    snowfall: Float32Array;
    weatherCode: Float32Array;
    cloudCover: Float32Array;
    windSpeed10m: Float32Array;
    isDay: Float32Array;

    constructor(time: Array<Date>,
        temperature2m: Float32Array,
        apparentTemperature: Float32Array,
        precipitationProbability: Float32Array,
        precipitation: Float32Array,
        snowfall: Float32Array,
        weatherCode: Float32Array,
        cloudCover: Float32Array,
        windSpeed10m: Float32Array,
        isDay: Float32Array,){
            this.time = time;
            this.temperature2m = temperature2m;
            this.apparentTemperature = apparentTemperature;
            this.precipitationProbability = precipitationProbability;
            this. precipitation = precipitation;
            this.snowfall = snowfall;
            this.weatherCode = weatherCode;
            this.cloudCover = cloudCover;
            this.windSpeed10m = windSpeed10m;
            this.isDay = isDay;

        }
}
