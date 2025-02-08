import { Injectable } from '@angular/core';
import Openrouteservice from 'openrouteservice';
import { RouteAPI } from '../../enviroments/environment';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {

  private locationList = new BehaviorSubject<{title:string, coordinates: [Number, Number]}[]>([]);
  autoCompletion = this.locationList.asObservable();
  constructor() { }

  // autoComplete(text: string):Observable<{title:string, coordinates: [Number, Number]}[]>{
  //   return from(this.getLocations(text))
  // }

  
  async autoComplete(text: string){
    let ors = new Openrouteservice(RouteAPI.apiKey!);
    const results = await ors.getGeocodeAutocomplete(text);
    let locations:Array<{title:string, coordinates:[Number, Number]}> = [];
    for (let i = 0; i < results.features.length; i++){
      let item: any;
      item = results.features[i];
      let name = item.properties.label;
      let coords = item.geometry.coordinates;
      locations.push({title: name, coordinates: coords})
    }
    // console.log(locations)
    this.locationList.next(locations)
  }

  async geocode(location: string){
    let ors = new Openrouteservice(RouteAPI.apiKey!);
    const coordinate = ors.getGeocodeSearch(location);
    console.log(coordinate);
  }
}
