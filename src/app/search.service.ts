import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private query = new BehaviorSubject<number[][]>([]);
  coordinate = this.query.asObservable();

  constructor() { }

  search(start: string, end: string){
    let startNums = start.split(",");
    let endNums = end.split(",");

    let starting = startNums.map(
      (num)=>{ 
        let newNum = parseFloat(num.trim());
        return newNum;
      }
    )

    let ending = endNums.map(
      (num)=>{ 
        let newNum = parseFloat(num.trim());
        return newNum;
      }
    )
    console.log(starting, ending);

    let search = [starting, ending];
    this.query.next(search)
  }
}
