import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.css'
})
export class LocationSearchComponent {

  routeForm = new FormGroup({
    whereFrom: new FormControl(''),
    whereTo: new FormControl('')})


  onSearch(){

  }

}
