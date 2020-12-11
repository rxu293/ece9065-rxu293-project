import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../user.service';
import { Loginres } from '../Loginres';
import { Observable, Subject } from 'rxjs';
import { SocialAuthService } from "angularx-social-login";
import { ScheduleService } from '../schedule.service';
import { reviewService } from '../review.service';
import { Schedule } from '../Schedule';
import { user } from '../user';
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
  reviewadding: boolean;
  usershowing: boolean;
  schedule_name: string;
  schedule_visibility: string;
  schedule_description: string;
  editSummary: string;
  editDetails: string;
  schedules$ : Observable<Schedule[]>;
  users$: Observable<user[]>;
  selectedSchedule: Schedule[];
  oldselectedSchedule: Schedule[];
  reviewSubject: string;
  reviewCatalog: string;
  reviewContent: string;

  private newSchedule: Schedule = {
    name : "",
    creator: "",
    modified_time: "",
    description: "",
    subject: "",
    catalog_nbr: "",
    start_time: "",
    end_time: "",
    term: "",
    year: 0,
    visibility: "",
    len: 0
  };
  constructor(
  private userService : UserService, private authService: SocialAuthService, 
  private scheduleService: ScheduleService, private reviewService: reviewService) { }

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
    this.scheduleshowing = false;
    this.schedules$ = null;
    this.reviewadding = false;
    this.usershowing = false;
  }

  onSelectShow() : void{
    this.scheduleadding = false;
    this.scheduleshowing = true;
    this.schedules$ = this.scheduleService.showMySchedules(this.jwt, this.user);
    this.reviewadding = false;
    this.usershowing = false;
  }

  onSelectSchedule(s : Schedule[]){
    this.selectedSchedule = s;
    this.oldselectedSchedule = Object.assign([], s); //shallow copy
  }

  offSelectSchedule(){
    this.selectedSchedule = null;
  }

  addNewSchedule(): void{
    if (!this.schedule_name)
    {
      this.errmsg = "Schedule name cannot be empty ";
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
    this.selectedSchedule.push(Object.assign({}, this.newSchedule));  
  }

  confirmEdit(): void{
   for (let c of this.selectedSchedule.slice(1))
   {
       if (!c.subject)
        {
         alert("subject name cannot be empty");
         return;
        }
       if (!c.catalog_nbr)
        {
         alert("catalog number cannot be empty");
         return; 
        }
       if (!c.start_time)
        {
         alert("start time cannot be empty");
         return; 
        }
       if (!c.end_time)
        {
         alert("end time cannot be empty");
         return;
        }  
   } 
   this.editSummary = "Edit Summary: The old schedule has " + 
   (this.oldselectedSchedule.length -1).toString() + 
   " courses, while the new schedule has " + (this.selectedSchedule.length - 1).toString()+ " courses.";
   this.editDetails = "Here are the courses names that old schedule has ";
   for (let c of this.oldselectedSchedule) 
   {
     if (c.subject === undefined)
       continue;
     this.editDetails += c.subject + ", ";
   }
   this.editDetails += "Here are the courses names that new schedule will have ";
   for (let c of this.selectedSchedule) 
   {
     if (c.subject === undefined)
       continue;
     this.editDetails += c.subject + ", ";
   }
   if(confirm(this.editSummary + "  " + this.editDetails + "  Confirm the changes?")){
     this.scheduleService.editSchedule(this.jwt, this.selectedSchedule[0].name, this.selectedSchedule).
     subscribe(ret => alert(ret.msg));
     this.offSelectSchedule();
     this.onSelectShow();
   }
  }
  
  deleteCourse(c : Schedule): void{
    this.selectedSchedule = this.selectedSchedule.filter(s => s !== c);
  }

  deleteSchedule(s : Schedule): void{
    if (confirm("Are you sure to delete schedule "+ s[0].name)) {
      this.scheduleService.deleteSchedule(this.jwt, s[0].name).subscribe(ret => {
        this.errmsg = ret.msg;
      this.onSelectShow();
     })
    }
  }

  addReview() : void{
    this.reviewService.addReview(this.jwt, this.reviewSubject, this.reviewCatalog, this.reviewContent)
    .subscribe(ret => alert(ret.msg));
    this.reviewadding = false;
  }

  onSelectReview(): void{
    this.reviewadding = true;
    this.scheduleadding = false;
    this.scheduleshowing = false;
    this.selectedSchedule = null;
    this.schedules$ = null;
    this.usershowing = false;
  }

  checkUsers(): void{
    this.reviewadding = false;
    this.scheduleadding = false;
    this.scheduleshowing = false;
    this.selectedSchedule = null;
    this.schedules$ = null;
    this.users$ = this.userService.getUsers(this.jwt);
    this.usershowing = true;
  }

  grantAdmin(u : user): void{
    this.userService.grantUser(this.jwt, u.username).
    subscribe(ret => {
      alert(ret.msg);
      this.checkUsers();
    })
  }

  activateUser(u : user): void{
    this.userService.changeUserStatus(this.jwt, u.username, "active").
    subscribe(ret => {
      alert(ret.msg);
      this.checkUsers();
    })
  }

  deactivateUser(u : user): void{
    this.userService.changeUserStatus(this.jwt, u.username, "inactive").
    subscribe(ret => {
      alert(ret.msg);
      this.checkUsers();
    })
  }
}
