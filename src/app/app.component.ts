import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OpenMapComponent } from "./open-map/open-map.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OpenMapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'roadtrip';
}
