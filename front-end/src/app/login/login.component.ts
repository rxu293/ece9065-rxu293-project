import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../user.service';
import { Loginres } from '../Loginres';
import { Observable, Subject } from 'rxjs';
import { SocialAuthService } from "angularx-social-login";
import { ScheduleService } from '../schedule.service';
import { Schedule } from '../Schedule';
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	loginres: Loginres;
	user: string;
	jwt : string;
	username: string;
	password: string;
	errmsg: string;
  level: string;
  scheduleadding: boolean;
  scheduleshowing: boolean;
  schedule_name: string;
  schedule_visibility: string;
  schedule_description: string;
  schedules$ : Observable<Schedule[]>;
  selectedSchedule: Schedule;
  constructor(
  private userService : UserService, private authService: SocialAuthService, private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    this.schedule_visibility = "private";
  }

  signInWithGoogle(): void {
   this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    this.authService.authState.subscribe(user => {
      this.user = user.email;
    });
  }

  login(): void{
  	this.userService.login(this.username, this.password).subscribe(ret => {
  		this.loginres = ret;
  		if (this.loginres.jwt)
  		{
  			this.user = this.username;
  			this.jwt = this.loginres.jwt;
        this.level = ret.level;
        this.username = null;
        this.password = null;
  		}
  		else
  		{
  			this.errmsg = this.loginres.msg;
  		}
  	})
  }

  logout():void{
    this.authService.signOut();
    this.user = null;
    this.jwt = null;
    this.level = null;
  }

  onSelectAdd(): void{
    this.scheduleadding = true;
  }

  onSelectShow() : void{
    this.scheduleadding = false;
    this.scheduleshowing = true;
    this.schedules$ = this.scheduleService.showMySchedules(this.jwt, this.user);
  }

  onSelectSchedule(s : Schedule){
    this.selectedSchedule = s;
  }

  offSelectSchedule(){
    this.selectedSchedule = null;
  }

  addNewSchedule(): void{
    if (!this.schedule_name)
    {
      this.errmsg = "Schedule name cannot be null ";
      return;
    }

    if (!this.schedule_visibility)
    {
      this.errmsg = "Visibility must be public or private";
      return;
    }

    this.scheduleService.addSchedule(this.jwt,this.schedule_name,this.schedule_description,this.schedule_visibility)
    .subscribe(ret =>{
      this.schedule_name = null;
      this.schedule_description = null;
      this.schedule_visibility = null;
      this.errmsg = ret.msg;
    })
  }  

  addNewLine(): void{

  }

}
