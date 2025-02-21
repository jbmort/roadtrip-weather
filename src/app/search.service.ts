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
    // let startNums = start.split(",");
    // let endNums = end.split(",");

    // let starting = startNums.map(
    //   (num)=>{ 
    //     let newNum = parseFloat(num.trim());
    //     return newNum;
    //   }
    // )

    // let ending = endNums.map(
    //   (num)=>{ 
    //     let newNum = parseFloat(num.trim());
    //     return newNum;
    //   }
    // )
    // console.log(starting, ending);

    let search = [start, end];
    this.query.next(search)
  }
}
