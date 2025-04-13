import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchService } from '../search.service';
import { GeocodeService } from '../geocode.service';

import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { debounceTime, filter, map, Observable, switchMap, tap } from 'rxjs';

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
        switchMap(() => this.geocodeService.autoCompletion.pipe(map(options => this.filterOptions(options))))
      );

      this.endingList = this.ending.valueChanges.pipe(
        debounceTime(300),
        filter((value): value is string => typeof value === 'string' && value.length > 2),
        tap((title) => {
          this.geocodeService.autoComplete(title);
        }),
        switchMap(() => this.geocodeService.autoCompletion.pipe(map(options => this.filterOptions(options))))
      );

      this.startingList.subscribe(
        (list) => {this.startLocations = list}
      )

      this.endingList.subscribe(
        (list) => {this.endLocations = list}
      )
  }


    start = new FormControl<{title: string, coordinates: Number[]} | string>('', [Validators.required]);
    ending = new FormControl<{title: string, coordinates: Number[]} | string>('', [Validators.required]);
 
  onSearch(){
    let startingPoint;
    let endingPoint;

    startingPoint = this.start.value as {title: string, coordinates: Number[]};
    endingPoint = this.ending.value as {title: string, coordinates: Number[]};

    console.log(startingPoint.coordinates, endingPoint.coordinates)

    if(startingPoint.coordinates && endingPoint.coordinates){

    this.searchService.search(startingPoint.coordinates, endingPoint.coordinates)
    }
    else{console.log("one component does not contain coordinate information")}
  }

  filterOptions(options: {title: string, coordinates: [Number, Number]}[]){
    return options.filter(option => {
      const parts = option.title.split(',').map(part => part.trim());
      if (parts.length > 2) {
        return true; // Keep if it matches "city, state, country"
      }
      return false; // Filter out if it doesn't 
  })}

  // updateStart(){
  //   if(this.start.value?.length! > 3){
  //   console.log(this.start.value);
  //   console.log(this.startLocations)
  //   }}


  // updateEnd(){
  //   if(this.routeForm.value.ending?.length! > 3){
  //   console.log(this.routeForm.value.ending);
  //   this.geocodeService.autoComplete(this.routeForm.value.ending!)
  //   }
  // }


  displayFn(location: {title: string, coordinates: Number[]} | string): string {
    return typeof location === 'object' ? location.title : location;
  }


  endDisplayFn(location: {title: string, coordinates: Number[]} | string): string {
    return typeof location === 'object' ? location.title : location;
  }

  onOptionSelected(event: any) {
    this.start.setValue(event.option.value);
  }

  endOptionSelected(event: any) {
    this.ending.setValue(event.option.value);
    }

}
