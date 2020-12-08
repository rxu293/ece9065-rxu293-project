import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Course } from './course';
import { Schedule } from './Schedule';
import { MessageService } from './message.service';
import { Loginres } from './Loginres';

@Injectable({
  providedIn: 'root'
})
export class UserService {

   private userLoginUrl = 'http://localhost:3000/api/login';  // URL to web api
   private userSignupUrl = 'http://localhost:3000/api/signup';
   
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})

  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService){}

  login(username: string, password : string): Observable<Loginres> {
  	let body = {username:username, password:password};
    let headers = { 'Content-Type': 'application/json' };
    return this.http.post<Loginres>(this.userLoginUrl, body, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Loginres>('userLogin'))
      );
  }

   signup(username: string, password : string): Observable<Loginres> {
    let body = {username:username, password:password};
    let headers = { 'Content-Type': 'application/json' };
    return this.http.post<Loginres>(this.userSignupUrl, body, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Loginres>('userSignup'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
	}
	}
      // Let the app keep running by returning an empty result.
      /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`CourseService: ${message}`);
  }
}
