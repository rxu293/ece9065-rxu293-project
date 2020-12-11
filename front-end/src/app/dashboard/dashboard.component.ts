import { Component, OnInit} from '@angular/core';
import { Course } from '../course';
import { courseService } from '../course.service';
import { ScheduleService } from '../schedule.service';
import { Schedule } from '../Schedule';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
 schedules$: Observable<Schedule[]>;
 selectedSchedule: Schedule;

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit() {
  	this.getPublicSchedules();
  }

  onSelect(s : Schedule){
  	this.selectedSchedule = s;
  }

  offSelect(){
  	this.selectedSchedule = null;
  }
  getPublicSchedules(): void {
  	this.schedules$ = this.scheduleService.getPublicSchedules();
  }
}
