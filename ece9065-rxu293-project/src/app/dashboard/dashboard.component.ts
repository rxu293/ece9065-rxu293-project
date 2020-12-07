import { Component, OnInit } from '@angular/core';
import { Course } from '../course';
import { courseService } from '../course.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
 courses: Course[] = [];

  constructor(private courseService: courseService) { }

  ngOnInit() {
  }

  getCourses(): void {
  }
}
