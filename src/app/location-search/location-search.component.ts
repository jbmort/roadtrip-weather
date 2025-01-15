import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [ReactiveFormsModule,],
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.css',
})
export class LocationSearchComponent {

  routeForm = new FormGroup({
    start: new FormControl(''),
    ending: new FormControl('')})


  onSearch(){
    console.log(this.routeForm.value)
  }

  updateStart(){
    if(this.routeForm.value.start?.length! > 3){
    console.log(this.routeForm.value.start)
    }
  }

  updateEnd(){
    if(this.routeForm.value.ending?.length! > 3){
    console.log(this.routeForm.value.ending)
    }
  }

}
