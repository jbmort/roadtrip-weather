import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OpenMapComponent } from "./open-map/open-map.component";
import { LocationSearchComponent } from "./location-search/location-search.component";
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { TripInfoComponent } from './trip-info/trip-info.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OpenMapComponent, LocationSearchComponent, HeaderComponent, FooterComponent, TripInfoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'roadtrip';
}
