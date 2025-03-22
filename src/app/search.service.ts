import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private query = new BehaviorSubject<Number[][]>([]);
  coordinate = this.query.asObservable();

  constructor() { }

  search(start: Number[], end: Number[]){

    let search = [start, end];
    this.query.next(search)
  }
}
