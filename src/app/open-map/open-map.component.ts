import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Collection, Feature } from 'ol';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style.js';
import { Coordinate } from 'ol/coordinate';
import MultiLineString from 'ol/geom/MultiLineString.js';
import { RouteServiceService } from '../route-service.service';
import { WeatherService } from '../weather.service';
import { Point } from 'ol/geom';
import { SearchService } from '../search.service';
import BaseLayer from 'ol/layer/Base';
import { WeatherDataType } from '../Types/weather-data-type';
import { WeatherDataService } from '../weather-data.service';

type forcastDataType = pointDataType[];

type pointDataType = {
  coordinate: [number, number],
  weatherData: WeatherDataType
};

@Component({
  selector: 'open-map',
  standalone: true,
  templateUrl: './open-map.component.html',
  styleUrls: ['./open-map.component.css'],
  template: '<div id="map" class="map"></div>',
})

export class OpenMapComponent implements OnInit {
  private map! : Map;
  transformedCoordinates: Coordinate[] = [];
  searchData: Number[][] = [];

  constructor(private routeService: RouteServiceService,
              private weatherService: WeatherService,
              private searchService: SearchService,
              private weatherDataService: WeatherDataService) {};

  forcastData: Partial<forcastDataType> = []
          
    ngOnInit(): void {
      
      this.map = new Map({
        view: new View({
          projection: 'EPSG:3857',
        center: fromLonLat([-93.0, 40.0]),
        zoom: 3
      }),
      layers: [
          new TileLayer({
              source: new OSM(),
            }),
          ],
          target: 'map'
        });
    // this.buildRoute(this.searchData);
    this.searchService.coordinate.subscribe(
      (search) => {
        this.removeRoute();
        if (search.length > 1){
        this.searchData = search;
        this.buildRoute(this.searchData);
        }
      }
    )
  };

// Collect weather data into forcastData Array along with coordinates
async loadData(data: {transformedCoordinates: Coordinate[], 
    tagLocations: Coordinate[] }, weatherService: WeatherService, 
    ): Promise<forcastDataType>{
      let forcastData: forcastDataType = [];

      const promises = data.tagLocations.map(point => {
        return new Promise<void>((resolve) => {
          weatherService.forcast(point[1], point[0]);
          this.weatherService.routeForcast.subscribe({
            next: (weatherData: WeatherDataType) => {
              let pointData: pointDataType = {
                coordinate: [point[0], point[1]],
                weatherData: weatherData
              };
              // keep data points in order with splice
                forcastData.splice(data.tagLocations.indexOf(point), 0,pointData);
              resolve();
            }
        });
        });
      });
      await Promise.all(promises);
      return forcastData
    };

// Loads weather data into markers and loads markers into a single layer on the map
 async createMarkers(this: any, map: Map, data: {transformedCoordinates: Coordinate[]; tagLocations: Coordinate[], centerPoint: Coordinate},
      weatherService : WeatherService){
    let forcastData =  await this.loadData(data, weatherService)
        console.log(forcastData)
    this.weatherDataService.updateWeatherData(forcastData);
    let weatherMarkers = [];

    for (let i = 0; i < forcastData.length; ++i ){
        let long = forcastData[i].coordinate[0]
        let lat = forcastData[i].coordinate[1]
        let position = forcastData.indexOf(forcastData[i])
        let tempData = String(Math.round(forcastData[i].weatherData.hourly.temperature2m[position]))
        let condition: string = this.defineCondition(forcastData[i].weatherData.hourly.cloudCover[position],
                                                     forcastData[i].weatherData.hourly.isDay[position],
                                                     forcastData[i].weatherData.hourly.precipitation[position],
                                                     forcastData[i].weatherData.hourly.precipitationProbability[position],
                                                     forcastData[i].weatherData.hourly.snowfall[position],
                                                     forcastData[i].weatherData.hourly.windSpeed10m[position],
                                                     forcastData[i].weatherData.hourly.weatherCode[position]
         )
        // console.log(long, forcastData[i].weatherData.hourly.temperature2m)
        const newMarker = this.addMarker([long, lat], tempData, condition )
        weatherMarkers.push(newMarker)
    };
    const markSource = new VectorSource({
      features: weatherMarkers
    });
    const markLayer = new VectorLayer({
      source: markSource})
    this.map.addLayer(markLayer)
}
  
// Creates the route layer with route line and calls for weather marker creation
  buildRoute(points: Number[][]){
      this.routeService.routeCall(points)
      this.routeService.routeData.subscribe({
        next: (data: {transformedCoordinates: Coordinate[], tagLocations: Coordinate[], centerPoint: Coordinate, zoomValue: Number }) => {
          this.transformedCoordinates = data.transformedCoordinates;
          let zoom = data.zoomValue as number
          
          const multiLineString = new MultiLineString([this.transformedCoordinates]);
          this.createMarkers(this.map, data, this.weatherService)
           
          const feature = new Feature({
            geometry: multiLineString
          });
  
          const vectorSource = new VectorSource({
            features: [feature]
          });

          const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
              stroke: new Stroke({
                color: 'red',
                width: 3
              })
            })
          });

          this.map.addLayer(vectorLayer);
          console.log(data.centerPoint);
          this.map.getView().setCenter(fromLonLat(data.centerPoint))
          this.map.getView().setZoom(zoom)
        }})
    }

// Creates individual marker points with weather data icons and returns the marker
    addMarker([lon, lat]: number[], temp: string, weatherCondition: string){
      var marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
      });
      var iconBlue = new Style({
        image: new Icon({
          anchor: [65, 175],
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
          opacity: 1,
          scale: .28,
          declutterMode: 'declutter',
          src: weatherCondition
        }),
        text: new Text({
          offsetY: -13,
          text: temp,
          scale: 1.2,
          fill: new Fill({
            color: "#fff"
          }),
          stroke: new Stroke({
            color: "0",
            width: 3
          })
      })
      });
      marker.setStyle(iconBlue);

      return marker;
    }
  
  // clear previous route layers to prepare for new route insertion
  removeRoute(){
    let layers  = this.map.getAllLayers();

    if(layers.length > 1){
      this.map.removeLayer(layers[1]);
      this.map.removeLayer(layers[2]);
    }
  }


  // create weather definitions for a singular condition
  defineCondition(cloudCover: number, 
                  isDay: number, 
                  precipitation: number, 
                  precipitationProbability: number,
                  snowfall: number,
                  windSpeed: number,
                  weatherCode: number
                ){
      let condition: string = '../../assets/Icon/sunny.png';
      console.log(cloudCover, isDay, precipitation, precipitationProbability, snowfall, windSpeed, weatherCode)
      
      //attribute for "The Icon Tree" and "Kosonicon" and "Alfredo Hernandez" and "smashicons"
      // Use switch block to determine weather symbol based on set of conditions
      switch(weatherCode){
// Clear Sky x
          case 0: if(windSpeed > 40){condition = '../../assets/Icon/high-wind.png'}
                  else {if(isDay == 1){
                      condition = '../../assets/Icon/clear-night.png';
                    }
                  else {
                      if(windSpeed > 20){
                        condition = '../../assets/Icon/clear-windy.png';
                      }
                      else{
                      condition = '../../assets/Icon/sunny.png';
                    }}}
                    break;
      
// Partly Cloudy 
          case 1:
          case 2: if(windSpeed > 40){condition = '../../assets/Icon/high-wind.png'}
                  else {
                  if(isDay == 1){
                      condition = '../../assets/Icon/night-cloudy.png';
                    }
                  else {
                      condition = '../../assets/Icon/partly-cloudy.png';
                    }}
                    break;
// Cloudy 
          case 3: if(windSpeed > 40){condition = '../../assets/Icon/high-wind.png'}
                  else {
                    if(windSpeed > 20){condition = '../../assets/Icon/windy.png'}
                    else{
                    condition = '../../assets/Icon/cloud.png';
                    }
                  }
                  break;
     
// Foggy
          case 45:
          case 48: condition = '../../assets/Icon/foggy.png';
                   break;
// Rainy 
          case 51:
          case 53:
          case 55:
          case 61:
          case 63:
          case 65:
          case 80:
          case 81:
          case 82:  if(cloudCover > 60){
                    condition = '../../assets/Icon/cloudy-rain.png'}
                    else{
                    if(isDay == 1){
                        condition = '../../assets/Icon/night-rain.png';
                      }
                    else {
                        condition = '../../assets/Icon/sunny-rain.png';
                      }}
                      break;
// Freezing Rain          
          case 66:
          case 67: condition = '../../assets/Icon/rain-alert.png';
                   break;
// Snowy
          case 71:
          case 73:
          case 75:
          case 77:
          case 85:
          case 86:  if(isDay == 1){
                        condition = 'src/assets/Icon/night-snow.png';
                      }
                    else {
                        condition = '../../assets/Icon/snow.png';
                      };
                    break;
// Thunder Storms 
          case 95:
          case 96:
          case 99:  if(windSpeed > 40){condition = '../../assets/Icon/severe-weather.png'}
                    else if(precipitation == 0 || precipitationProbability < 15){
                        condition = '../../assets/Icon/lighting.png';
                      }
                    else{
                        if(isDay == 1){
                            condition = 'src/assets/Icon/night-thunder.png';
                          }
                        else {
                            condition = '../../assets/Icon/thunderstorm.png';
                          };}
                    break;
      }
      return condition;
  }

}
