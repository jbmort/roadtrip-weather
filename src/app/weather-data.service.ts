import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WeatherDataType } from './Types/weather-data-type';

type forcastDataType = pointDataType[];

type pointDataType = {
  coordinate: [number, number],
  weatherData: WeatherDataType
};

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {

  constructor() { }

  weatherData = new Subject<forcastDataType>

  updateWeatherData(datapoint: forcastDataType){
    this.weatherData.next(datapoint);
  }
}
