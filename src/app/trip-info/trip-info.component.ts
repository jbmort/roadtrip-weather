import { Component } from '@angular/core';
import { RouteServiceService } from '../route-service.service';
import { WeatherService } from '../weather.service';

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
  constructor(private routeService: RouteServiceService, private weatherService: WeatherService){

  }

  ngOnInit(): void{
    this.routeService.routeData.subscribe({
      next: (data) => {
        data.distance = this.distance;
        data.minutes = this.minutes;
      }
    })
  }

}
