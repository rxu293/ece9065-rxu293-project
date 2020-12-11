import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Course } from './course';
import { Schedule } from './Schedule';
import { Loginres } from './Loginres';
import { MessageService } from './message.service';
import { user } from './user';

@Injectable({ providedIn: 'root' })

export class ScheduleService {

  private publicScheduleUrl = 'http://localhost:3000/api/open/schedules';  // URL to web api
  private addScheduleUrl = 'http://localhost:3000/api/secure/schedule';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})

  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService){}

  /** GET coursees from the server */
  getPublicSchedules(): Observable<Schedule[]> {
    let headers = { 'Content-Type': 'application/json' };
    return this.http.get<Schedule[]>(this.publicScheduleUrl)
      .pipe(
        tap(_ => this.log('fetched coursees')),
        catchError(this.handleError<Schedule[]>('getPublicSchedules', []))
      );
  }

   addSchedule(jwt: string, schedulename: string, description: string, visibility: string): Observable<Loginres> {
    let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };
    let body = {schedule_name:schedulename, description:description, visibility:visibility};
    return this.http.post<Loginres>(this.addScheduleUrl, body, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Loginres>('add schedule fail'))
      );
  }

   showMySchedules(jwt: string, user: string): Observable<Schedule[]> {
     let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };
    return this.http.get<Schedule[]>(this.addScheduleUrl + '/' + user, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Schedule[]>('getMySchedules', []))
      );
  }

  editSchedule(jwt: string, schedule_name: string, data : Schedule[]): Observable<Loginres> {
     let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };
     let body = {pairs: data};
    return this.http.post<Loginres>(this.addScheduleUrl + '/' +  schedule_name, body, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Loginres>('editSchedule'))
      );
  }

    deleteSchedule(jwt: string, schedule_name: string):  Observable<Loginres>{
      let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };
    return this.http.delete<Loginres>(this.addScheduleUrl + '/' + schedule_name, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Loginres>('deleteSchedule'))
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
