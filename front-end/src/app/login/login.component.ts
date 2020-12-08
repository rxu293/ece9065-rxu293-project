import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Loginres } from '../Loginres';
import { Observable, Subject } from 'rxjs';
import { SocialAuthService } from "angularx-social-login";
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
  constructor(private userService : UserService, private authService: SocialAuthService) { }

  ngOnInit(): void {
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
}
