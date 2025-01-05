import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Stroke, Style } from 'ol/style.js';
import { Coordinate } from 'ol/coordinate';
import MultiLineString from 'ol/geom/MultiLineString.js';
import { RouteServiceService } from '../route-service.service';
import { WeatherService } from '../weather.service';

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
  forcastData: {} = {};

  constructor(private routeService: RouteServiceService, private weatherService: WeatherService) {}

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
    this.weather()
  }

  buildRoute(){
      this.routeService.getRoute().subscribe(
        (coordinates: Coordinate[]) => {
          this.transformedCoordinates = coordinates;
          const multiLineString = new MultiLineString([coordinates]);


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
          console.log(vectorSource.getFeatures(), feature.getGeometry())

          this.map.addLayer(vectorLayer)
        })
    }

    weather(){
      this.weatherService.getForcast().subscribe(
        (weatherData: {}) => { this.forcastData = weatherData}
      )
    }

  }
