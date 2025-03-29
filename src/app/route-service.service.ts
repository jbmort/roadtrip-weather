import { Injectable } from '@angular/core';
import { RouteAPI } from '../../enviroments/environment';
import Openrouteservice from 'openrouteservice';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import { Profile } from 'openrouteservice/dist/common.js';
import { DirectionsFormat } from 'openrouteservice/dist/directions.js';
import { Observable, Subject, from } from 'rxjs';
import { MatrixMetrics } from 'openrouteservice/dist/matrix';


@Injectable({
  providedIn: 'root'
})
export class RouteServiceService {

  routeData = new Subject<{transformedCoordinates: Coordinate[], tagLocations: Coordinate[], centerPoint: Coordinate, zoomValue: Number, distance: number, minutes: number }>;

  // getRoute(search: Number[][]): Observable<{transformedCoordinates: Coordinate[], tagLocations: Coordinate[], centerPoint: Coordinate, zoomValue: Number, distance: number, minutes: number }> {
  //   return from(this.routeCall(search));
  // }

  public async routeCall(search: Number[][]): Promise<void> {
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
      let distance = directions.features[0].properties.segments[0].distance;
      let totalTags = Math.ceil(minutes/3600);
      let zoom = this.zoomValue(distance)

      let pathCoordinates = directions.features[0].geometry.coordinates as Array<Array<number>>;
      
      let locations: Coordinate[] = [];
      let totalCoords = pathCoordinates.length
      let distanceBetween = totalCoords / totalTags
      let center = pathCoordinates[Math.floor(totalCoords/2) + 1]

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

     this.routeData.next({transformedCoordinates: transformedCoordinates , tagLocations: locations, centerPoint: center, zoomValue: zoom, distance: distance, minutes: minutes });
  }

  zoomValue(distance: number): number {
    const logDistance = Math.log(distance);

    const a = 0.02988405;
    const b = -2.06771751;
    const c = 27.90493554;

    const zoom = a * (logDistance ** 2) + b * logDistance + c;
    return Number(Math.max(3.5, Math.min(15.5, zoom)).toFixed(1));
}

}

// must be less than 6000000 meters
// 4687021.4 san fran to new york 3.5
// 5467850.7 olympia to Miami 3.5
// 3294606.4 san fran to st louis 4
// 2681746.7 san fran to omaha 4.2
// 2049371.7 san fran to scottsbluff 4.8
// 1474603 san fran to rock springs 5
// 1181533 san fran to salt lake 5.2
// 618722.1 san fran to winnemucca 6
// 405863.6 san fran to carson city 6.6
// 277417.2 san fran to chico 7.1
// 145533.9 san fran to sacramento 7.8
// 79365.3 san fran to fairfield 8.4
// 41037.7 san fran to walnut creek 9.5
// 26209.6 san fran to oakland 10.4
// 19082.4 san fran to daly city 11
// 10295 daly city to san bruno 12
// 7079.8 san bruno to millbrae 12.8
// 2165 home to south warrior 14
// 879 home to cardinal 15.5

// Zoom=0.02988405(log(distance)) 
// 2
//  −2.06771751(log(distance))+28.30493554


