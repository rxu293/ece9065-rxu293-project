import { Component, OnInit } from '@angular/core';

import { Course } from '../course';
import { courseService } from '../course.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[];

  constructor(private courseService: courseService) { }

  ngOnInit() {
  }

  getCourses(): void {
  }
}
