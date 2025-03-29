import { Component } from '@angular/core';
import { RouteServiceService } from '../route-service.service';
import { WeatherService } from '../weather.service';
import { WeatherDataType } from '../Types/weather-data-type';
import { Coordinate } from 'ol/coordinate';
import { WeatherDataService } from '../weather-data.service';

type forcastDataType = pointDataType[];

type pointDataType = {
  coordinate: [number, number],
  weatherData: WeatherDataType
};


@Component({
  selector: 'app-trip-info',
  standalone: true,
  imports: [],
  templateUrl: './trip-info.component.html',
  styleUrl: './trip-info.component.css'
})
export class TripInfoComponent {
  distance: number = 0;
  minutes: number = 0;

  tripDistance: string = "";
  tripTime: string = "";
  tempString: string = "";
  precipitationChance: string = "";
  windHazard: string = "";

  weatherpoints: forcastDataType = [];
  constructor(private routeService: RouteServiceService,
              // private weatherService: WeatherService,
              private weatherDataService: WeatherDataService){}

  ngOnInit(): void{
    this.routeService.routeData.subscribe({
      next: (data) => {
        this.distance = data.distance;
        this.minutes = data.minutes;
        this.tripDistance = this.distanceString();
        this.tripTime = this.timeString();
      }
    })

    this.weatherDataService.weatherData.subscribe({
      next: (data: forcastDataType) => {
        this.weatherpoints = data
        this.tripWeatherData();
        
      }
    })
  }



  // add function to clear weatherpoints when a new search fires
  // utilize weather data
  // connect data to html with conditional ngIF
  // add error handling statements to this section for errors related to bad data returned from API

  distanceString(){
    if(this.distance < 400){
    let feet = Number(this.distance * 3.281);
    return Math.floor(feet) + " feet"}
    else{
      let miles = Number(this.distance / 1609);
      return miles.toFixed(1) + " miles"
    }
  }

  timeString(){
    let minutes = Math.round((this.minutes / 60) % 60);
    let hours = Math.floor(this.minutes / 60 / 60);
    let returnString = "";

    if(minutes > 0 && hours > 1){
     returnString = hours + " Hours " + minutes + " minutes";
    }
    else if(minutes > 0 && hours == 1){
      returnString = hours + " Hours " + minutes + " minutes"
    }
    else if(minutes > 0 && hours == 0){
      returnString = minutes + " minutes"
    }
    else if(minutes == 0 && hours > 1){
      returnString = hours + " hours"
    }
    else if(minutes == 0 && hours == 1){
      returnString = hours + " hours"
    }

    return returnString;
  }

  tripWeatherData(){
    let count = 0;
    let totalTemp = 0;
    let hiTemp = 0;
    let lowTemp = 200;
    
    let precip: number[] = [];
    let windHazard = "No hazardous wind conditions";
    let hazardCounter = 0;

    for (let i = 0; i < this.weatherpoints.length; ++i ){
      // let long = forcastData[i].coordinate[0]
      // let lat = forcastData[i].coordinate[1]
      let position = this.weatherpoints.indexOf(this.weatherpoints[i])
      let temp = Math.round(this.weatherpoints[i].weatherData.hourly.temperature2m[position])
      totalTemp = temp + totalTemp;

      if (temp > hiTemp){hiTemp = temp};
      if (temp < lowTemp){lowTemp = temp};
      if (this.weatherpoints[i].weatherData.hourly.precipitationProbability[position] > 0){
        precip.push(this.weatherpoints[i].weatherData.hourly.precipitationProbability[position])};
      if (this.weatherpoints[i].weatherData.hourly.windSpeed10m[position] > 40){
        windHazard = "Hazardous Wind Conditions along Route";
        hazardCounter =+ 1;
        if (hazardCounter > 1){
          windHazard = `Hazardous Wind Conditions at ${hazardCounter} points along your route`
        }};
      count= count + 1;
      console.log(i,temp, totalTemp, hiTemp, lowTemp )
    }
      
    
      // let condition: string = this.defineCondition(forcastData[i].weatherData.hourly.cloudCover[position],
      //                                              forcastData[i].weatherData.hourly.isDay[position],
      //                                              forcastData[i].weatherData.hourly.precipitation[position],
      //                                              forcastData[i].weatherData.hourly.precipitationProbability[position],
      //                                              forcastData[i].weatherData.hourly.snowfall[position],
      //                                              forcastData[i].weatherData.hourly.windSpeed10m[position],
      //                                              forcastData[i].weatherData.hourly.weatherCode[position]
      //  )
    
    // for(let weather of this.weatherpoints){
    //   // let temp = weather.hourly.temperature2m[count];
    //   // totalTemp = temp + totalTemp;

    //   // if (temp > hiTemp){hiTemp = temp};
    //   // if (temp < lowTemp){lowTemp = temp};
    //   // if (weather.hourly.precipitationProbability[count] > 0){precip.push(weather.hourly.precipitationProbability[count])};
    //   // if (weather.hourly.windSpeed10m[count] > 40){
    //   //   windHazard = "Hazardous Wind Conditions along Route";
    //   //   hazardCounter =+ 1;
    //   //   if (hazardCounter > 1){
    //   //     windHazard = `Hazardous Wind Conditions at ${hazardCounter} points along your route`
    //   //   }};
    //   count = count + 1;
    //   console.log(count, temp)
    // }

    let precipPotential: number = Math.max(...precip);
    let avgTemp = Math.round(totalTemp / (count));

    this.tempString = `High: ${Math.round(hiTemp)}\xB0 Low: ${Math.round(lowTemp)}\xB0 Avg: ${avgTemp}\xB0`;
    if(precipPotential > 0){
    this.precipitationChance = `${precipPotential}%`;}
    else {this.precipitationChance = "No Precipitation"}
    this.windHazard = windHazard;
  }
}
