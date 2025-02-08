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
  searchData: number[][] = [];

  constructor(private routeService: RouteServiceService,
              private weatherService: WeatherService,
              private searchService: SearchService) {};

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
          weatherService.getForcast(point[1], point[0]).subscribe(
            (weatherData: weatherDataType) => {
              let pointData: pointDataType = {
                coordinate: [point[0], point[1]],
                weatherData: weatherData
              };
              // keep data points in order with splice
                forcastData.splice(data.tagLocations.indexOf(point), 0,pointData);
              resolve();
            }
          );
        });
      });
      await Promise.all(promises);
      return forcastData
    };

// Loads weather data into markers and loads markers into a single layer on the map
 async createMarkers(this: any, map: Map, data: {transformedCoordinates: Coordinate[]; tagLocations: Coordinate[]},
      weatherService : WeatherService){
    let forcastData =  await this.loadData(data, weatherService)

    let weatherMarkers = []

    for (let i = 0; i < forcastData.length; ++i ){
        let long = forcastData[i].coordinate[0]
        let lat = forcastData[i].coordinate[1]
        let position = forcastData.indexOf(forcastData[i])
        let tempData = String(Math.round(forcastData[i].weatherData.hourly.temperature2m[position]))
        console.log(long, forcastData[i].weatherData.hourly.temperature2m)
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
  
// Creates the route layer with route line and calls for weather marker creation
  buildRoute(points: number[][]){
      this.routeService.getRoute(points).subscribe(
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
                width: 3
              })
            })
          });

          this.map.addLayer(vectorLayer)
        })
    }

// Creates individual marker points with weather data icons and returns the marker
    addMarker([lon, lat]: number[], temp: string){
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

}
