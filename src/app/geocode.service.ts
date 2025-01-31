import { Injectable } from '@angular/core';
import Openrouteservice from 'openrouteservice';
import { RouteAPI } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {
  constructor() { }

  
  async autoComplete(text: string){
    let ors = new Openrouteservice(RouteAPI.apiKey!);
    const results = await ors.getGeocodeAutocomplete(text);
    console.log(results)
  }

  async geocode(location: string){
    let ors = new Openrouteservice(RouteAPI.apiKey!);
    const coordinate = ors.getGeocodeSearch(location);
    console.log(coordinate);
  }
}
