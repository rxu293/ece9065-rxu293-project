import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Course } from './course';
import { Review } from './review';
import { Loginres } from './Loginres';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class reviewService {

  private courseUrl = 'http://localhost:3000/api/open/reviews';  // URL to web api
  private addReviewUrl = 'http://localhost:3000/api/secure/review';
  private allReviewUrl = 'http://localhost:3000/api/admin/reviews';
  private changeReviewVisiblityUrl = 'http://localhost:3000/api/admin/review';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})

  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService){}

  /** GET reviews from the server */
  getreview(subject: string, catalog_nbr:string): Observable<Review[]> {
    const body = {subject : subject, catalog_nbr : catalog_nbr};
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<Review[]>(this.courseUrl, body, {headers})
      .pipe(
        tap(_ => this.log('fetched reviews')),
        catchError(this.handleError<Review[]>('getcoursees', []))
      );
  }

  addReview(jwt: string, subject: string, catalog_nbr: string, content: string):Observable<Loginres>{
      let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };
      let body = {subject:subject, catalog_nbr: catalog_nbr, content: content};
    return this.http.post<Loginres>(this.addReviewUrl, body, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Loginres>('addReview'))
      );
    }

   getAllReview(jwt: string): Observable<Review[]> {
    let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };
    return this.http.get<Review[]>(this.allReviewUrl, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Review[]>('getReivews', []))
      );
  }

    changeReviewVisiblity(jwt: string, subject: string, catalog_nbr: string, modified_time: number, flag: string): Observable<Loginres> {
    let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };
    let body = {subject:subject, catalog_nbr: catalog_nbr, modified_time: modified_time, flag: flag};
    return this.http.post<Loginres>(this.changeReviewVisiblityUrl, body, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Loginres>('changeReviewVisiblity'))
      );
  }  

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`CourseService: ${message}`);
  }
}
