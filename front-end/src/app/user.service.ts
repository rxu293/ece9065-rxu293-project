import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Course } from './course';
import { Schedule } from './Schedule';
import { MessageService } from './message.service';
import { Loginres } from './Loginres';
import { user } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

   private userLoginUrl = 'http://localhost:3000/api/login';  // URL to web api
   private userSignupUrl = 'http://localhost:3000/api/signup';
   private userGetUrl = 'http://localhost:3000/api/admin/users';
   private userGrantUrl = 'http://localhost:3000/api/admin/privilige';
   private userChangeStatusUrl = 'http://localhost:3000/api/admin/userstatus'
   
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

  getUsers(jwt: string): Observable<user[]>{
    let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };    
    return this.http.get<user[]>(this.userGetUrl, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<user[]>('getUsers'))
      );
  }

  grantUser(jwt: string, username: string): Observable<Loginres>{
    let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };    
    return this.http.post<Loginres>(this.userGrantUrl + '/' + username, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Loginres>('grantAdmin'))
      );
  }

  changeUserStatus(jwt: string, username: string, flag: string): Observable<Loginres>{
    let headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}` };    
    let body = {flag: flag};
    return this.http.post<Loginres>(this.userChangeStatusUrl + '/' + username, body, {headers})
      .pipe(
        tap(),
        catchError(this.handleError<Loginres>('changeUserStatus'))
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
