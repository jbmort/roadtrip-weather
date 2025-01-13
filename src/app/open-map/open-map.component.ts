import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style.js';
import { Coordinate } from 'ol/coordinate';
import MultiLineString from 'ol/geom/MultiLineString.js';
import { RouteServiceService } from '../route-service.service';
import { WeatherService } from '../weather.service';
import { Point } from 'ol/geom';

type forcastDataType = pointDataType[];
type weatherDataType = {
  hourly: {
    apparentTemperature: Float32Array,
    cloudCover: Float32Array,
    isDay: Float32Array,
    precipitation: Float32Array,
    precipitationProbability: Float32Array
    snowDepth: Float32Array,
    snowfall: Float32Array,
    temperature2m: Float32Array,
    time: Array<Date>,
    windSpeed10m: Float32Array,
  }
}
type pointDataType = {
  coordinate: [number, number],
  weatherData: weatherDataType
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
  constructor(private routeService: RouteServiceService, private weatherService: WeatherService) {
  }
  forcastData: Partial<forcastDataType> = []
          
    ngOnInit(): void {
      
      this.map = new Map({
        view: new View({
          projection: 'EPSG:3857',
        center: fromLonLat([-93.0, 40.0]),
        zoom: 6
      }),
      layers: [
          new TileLayer({
              source: new OSM(),
            }),
          ],
          target: 'map'
        });
    this.buildRoute();
  };

// Collect weather data into forcastData Array along with coordinates
async loadData(data: {transformedCoordinates: Coordinate[], 
    tagLocations: Coordinate[] }, weatherService: WeatherService, 
    ): Promise<forcastDataType>{
      let forcastData: forcastDataType = [];

      const promises = data.tagLocations.map(point => {
        return new Promise<void>((resolve) => {
          weatherService.getForcast(point[1], point[0]).subscribe(
            (weatherData: weatherDataType) => {
              let pointData: pointDataType = {
                coordinate: [point[0], point[1]],
                weatherData: weatherData
              };
                forcastData.push(pointData);
              resolve();
            }
          );
        });
      });
      await Promise.all(promises);
      return forcastData
    };

 async createMarkers(this: any, map: Map, data: {transformedCoordinates: Coordinate[]; tagLocations: Coordinate[]},
      weatherService : WeatherService){
    let forcastData =  await this.loadData(data, weatherService)

    let weatherMarkers = []

    for (let i = 0; i < forcastData.length; ++i ){
        let long = forcastData[i]!.coordinate[0]
        let lat = forcastData[i]!.coordinate[1]
        let tempData = String(Math.round(forcastData[i]!.weatherData.hourly.temperature2m[0]))
        
        const newMarker = this.addMarker([long, lat], tempData )
        weatherMarkers.push(newMarker)
    };
    const markSource = new VectorSource({
      features: weatherMarkers
    });
    const markLayer = new VectorLayer({
      source: markSource})
    this.map.addLayer(markLayer)
}
  

  buildRoute(){
      this.routeService.getRoute().subscribe(
        (data: {transformedCoordinates: Coordinate[], tagLocations: Coordinate[] }) => {
          this.transformedCoordinates = data.transformedCoordinates;
          
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
                width: 4
              })
            })
          });

          this.map.addLayer(vectorLayer)
        })
    }

    addMarker([lon, lat]: number[], temp: string){
      var mar = new Feature({
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
          src: '../../assets/Icon/sunny.png'
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
      mar.setStyle(iconBlue);

      return mar;
    }
  

}
