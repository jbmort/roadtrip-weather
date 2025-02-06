import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../search.service';
import { GeocodeService } from '../geocode.service';

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [ReactiveFormsModule,],
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.css',
})
export class LocationSearchComponent {

  constructor( private searchService: SearchService, private geocodeService: GeocodeService){}

  routeForm = new FormGroup({
    start: new FormControl(''),
    ending: new FormControl('')})


  onSearch(){
    console.log(this.routeForm.value);
    let start = this.routeForm.value.start!.toString();
    let end = this.routeForm.value.ending!.toString();
    if(start != null && end != null){
    this.searchService.search(start, end);}
  }

  updateStart(){
    if(this.routeForm.value.start?.length! > 3){
    console.log(this.routeForm.value.start);
    this.geocodeService.autoComplete(this.routeForm.value.start!).subscribe((locations)=>{
      for(let i = 0; i < locations.length; i++){
      console.log(locations[i].title)}
    })
    }
}

  updateEnd(){
    if(this.routeForm.value.ending?.length! > 3){
    console.log(this.routeForm.value.ending);
    this.geocodeService.autoComplete(this.routeForm.value.ending!)
    }
  }

}
