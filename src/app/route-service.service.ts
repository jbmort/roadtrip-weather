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

  getRoute(search: Number[][]): Observable<{transformedCoordinates: Coordinate[], tagLocations: Coordinate[] }> {
    return from(this.routeCall(search));
  }

  private async routeCall(search: Number[][]): Promise<{transformedCoordinates: Coordinate[], tagLocations: Coordinate[] }> {
    const ors = new Openrouteservice(RouteAPI.apiKey!);
    const directions = await ors.getDirections(
      Profile.DRIVING_CAR,
      DirectionsFormat.GEOJSON,
        { 
            coordinates: search
            // [
            //     [-93.8746, 41.61118],
            //     [-91.55069198363068, 41.661711208216715]
            // ]
        }
    );
    console.log(directions)
      let minutes = directions.features[0].properties.segments[0].duration;
      let totalTags = Math.ceil(minutes/3600);

      let pathCoordinates = directions.features[0].geometry.coordinates as Array<Array<number>>;
      
      let locations: Coordinate[] = [];
      let totalCoords = pathCoordinates.length
      let distanceBetween = totalCoords / totalTags

      function getTagLocations( Coordinates:Coordinate[]){
        locations.push(Coordinates[0])
        let coordNumber = Math.floor(distanceBetween)
        for(let i = 0; i < totalTags - 1; i++ ){
          locations.push(Coordinates[(coordNumber * (i + 1))]);
        }
        locations.push(Coordinates[totalCoords - 1])
      }
      
      getTagLocations(pathCoordinates)
    

     const transformedCoordinates = pathCoordinates.map(coord => fromLonLat([coord[0], coord[1]], 'EPSG:3857'));

     return {transformedCoordinates: transformedCoordinates , tagLocations: locations };
  }

}