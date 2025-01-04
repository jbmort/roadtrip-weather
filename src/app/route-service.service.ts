import { Injectable } from '@angular/core';
import { RouteAPI } from '../../enviroments/environment';
import Openrouteservice from 'openrouteservice';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import { Profile } from 'openrouteservice/dist/common.js';
import { DirectionsFormat } from 'openrouteservice/dist/directions.js';
import { Observable, from } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RouteServiceService {

  getRoute(): Observable<Coordinate[]> {
    return from(this.routeCall());
  }

  private async routeCall(): Promise<Coordinate[]> {
    const ors = new Openrouteservice(RouteAPI.apiKey!);
    const directions = await ors.getDirections(
      Profile.DRIVING_CAR,
      DirectionsFormat.GEOJSON,
        { 

            coordinates: [
                [-93.8746, 41.61118],
                [-91.55069198363068, 41.661711208216715]
            ]
        }
    );
    console.log(directions)
      let pathCoordinates = directions.features[0].geometry.coordinates as Array<Array<number>>;


     const transformedCoordinates = pathCoordinates.map(coord => fromLonLat([coord[0], coord[1]], 'EPSG:3857'));

     return transformedCoordinates;
  }
}