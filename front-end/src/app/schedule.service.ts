import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Course } from './course';
import { Schedule } from './Schedule';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })

export class ScheduleService {

  private publicScheduleUrl = 'http://localhost:3000/api/open/schedules';  // URL to web api
  private keywordUrl = 'http://localhost:3000/api/open/search';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})

  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService){}

  /** GET coursees from the server */
  getPublicSchedules(): Observable<Schedule[]> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.get<Schedule[]>(this.publicScheduleUrl)
      .pipe(
        tap(_ => this.log('fetched coursees')),
        catchError(this.handleError<Schedule[]>('getPublicSchedules', []))
      );
  }

   getcoursebykeyword(keyword: string): Observable<Course[]> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.get<Course[]>(this.keywordUrl+"/"+keyword)
      .pipe(
        tap(_ => this.log('fetched coursees')),
        catchError(this.handleError<Course[]>('getcoursees', []))
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
