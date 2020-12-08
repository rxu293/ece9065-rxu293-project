import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Loginres } from '../Loginres';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

    signupres: Loginres;
	username: string;
	password: string;
	errmsg: string;
	verifylink: string;
    constructor(private userService : UserService) { }

  ngOnInit(): void {
  }

  signup(): void{
  	this.errmsg = null;
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.username))
    {
    	this.errmsg = "please use a correct email format";
    	return;
    }
    if (!this.password)
    {
    	this.errmsg = "please input the password";
    	return;
    }
    this.userService.signup(this.username, this.password).subscribe(ret => {
  		if (ret.verifylink)
  		{
  			this.verifylink = ret.verifylink;
  		}
  		else
  		{
  			this.errmsg = ret.msg;
  		}
  	})
  }

}
