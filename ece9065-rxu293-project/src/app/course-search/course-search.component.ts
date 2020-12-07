import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Course } from '../course';
import { courseService } from '../course.service';

@Component({
  selector: 'app-course-search',
  templateUrl: './course-search.component.html',
  styleUrls: [ './course-search.component.css' ]
})
export class CourseSearchComponent implements OnInit {
  courses$: Observable<Course[]>;
  subject: string;
  catalog_nbr:string;
  private searchTerms = new Subject<string>();

  constructor(private courseService: courseService) {}

  // Push a search term into the observable stream.
  searchCourse(): void {
   this.courses$ = this.courseService.getcourse(this.subject, this.catalog_nbr);
  }

  ngOnInit(): void {
  }
}

