import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoursesComponent } from './courses/courses.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CourseSearchComponent } from './course-search/course-search.component';
import { MessagesComponent } from './messages/messages.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { LoginUserComponent } from './login-user/login-user.component';

@NgModule({
  declarations: [
    AppComponent,
    CoursesComponent,
    CourseDetailComponent,
    DashboardComponent,
    CourseSearchComponent,
    MessagesComponent,
    SignupComponent,
    LoginComponent,
    LoginUserComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
