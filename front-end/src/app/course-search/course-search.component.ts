import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Course } from '../course';
import { courseService } from '../course.service';
import { Review } from '../review';
import { reviewService } from '../review.service'

@Component({
  selector: 'app-course-search',
  templateUrl: './course-search.component.html',
  styleUrls: [ './course-search.component.css' ]
})
export class CourseSearchComponent implements OnInit {
  courses$: Observable<Course[]>;
  reviews$: Observable<Review[]>;
  subject: string;
  catalog_nbr:string;
  keyword: string;
  selectedCourse: Course;

  constructor(private courseService: courseService, private reviewService: reviewService) {}

  searchCourse(): void {
  	this.selectedCourse = null;
    this.reviews$ = null;
    this.courses$ = this.courseService.getcourse(this.subject, this.catalog_nbr);
  }
  
  searchKeyword(): void{
    this.selectedCourse = null;
    this.reviews$ = null;
    this.courses$ = this.courseService.getcoursebykeyword(this.keyword);
  }
  
  onSelect(course:Course): void{
  	this.selectedCourse = course;
    this.reviews$ = this.reviewService.
    getreview(this.selectedCourse.subject, this.selectedCourse.catalog_nbr);
  }
  ngOnInit(): void {
  }
}

