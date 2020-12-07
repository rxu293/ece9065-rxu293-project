import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Course } from '../courses';
import { courseService } from '../course.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: [ './course-detail.component.css' ]
})
export class CourseDetailComponent implements OnInit {
  course: Course;

  constructor(
    private route: ActivatedRoute,
    private CourseService: courseService,
    private location: Location
  ) {}

  ngOnInit(): void {
  }


  goBack(): void {
    this.location.back();
  }
}
