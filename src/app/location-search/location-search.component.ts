import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../search.service';
import { GeocodeService } from '../geocode.service';

import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { debounceTime, filter, Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatFormFieldModule, AsyncPipe],
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationSearchComponent implements OnInit {

  startingList!: Observable<{title: string, coordinates: [Number, Number]}[]>;
  endingList!: Observable<{title: string, coordinates: [Number, Number]}[]>;
  startLocations: {title: string, coordinates: [Number, Number]}[] = [];
  endLocations: {title: string, coordinates: [Number, Number]}[] = [];

  
  constructor( private searchService: SearchService, private geocodeService: GeocodeService){};

  

  ngOnInit(): void {
      this.startingList = this.start.valueChanges.pipe(
        debounceTime(300),
        filter((value): value is string => typeof value === 'string' && value.length > 2),
        tap((title) => {
          this.geocodeService.autoComplete(title);
        }),
        switchMap(() => this.geocodeService.autoCompletion)
      );

      this.endingList = this.ending.valueChanges.pipe(
        debounceTime(300),
        filter((value): value is string => typeof value === 'string' && value.length > 2),
        tap((title) => {
          this.geocodeService.autoComplete(title);
        }),
        switchMap(() => this.geocodeService.autoCompletion)
      );

      this.startingList.subscribe(
        (list) => {this.startLocations = list}
      )

      this.endingList.subscribe(
        (list) => {this.endLocations = list}
      )
  }

    start =  new FormControl('')
    ending = new FormControl('')

  // onSearch(){
  //   console.log(this.routeForm);
  //   let start = this.routeForm.value.start!.toString();
  //   let end = this.routeForm.value.ending!.toString();
  //   if(start != null && end != null){
  //   this.searchService.search(start, end);}
  // }


  updateStart(){
    if(this.start.value?.length! > 3){
    console.log(this.start.value);
    console.log(this.startLocations)
    }}


  // updateEnd(){
  //   if(this.routeForm.value.ending?.length! > 3){
  //   console.log(this.routeForm.value.ending);
  //   this.geocodeService.autoComplete(this.routeForm.value.ending!)
  //   }
  // }

  displayFn(user: {title: string, coordinates: [Number, Number]}): string {
    console.log(user.title)
    return user.title;
  }

  onOptionSelected(event: any) {
    console.log(event.option.value);
    this.start.setValue(event.option.value);
  }
  endOptionSelected(event: any) {
    console.log(event.option.value);
    this.ending.setValue(event.option.value);
    }

}
