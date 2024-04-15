import { Component, OnInit} from '@angular/core';
import './custom.js';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage!: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiRequestService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('itsLoged')) {
      this.router.navigate(['/home']);
    }
  }

  enviarLogin(): void {
    if (this.loginForm.valid) {
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.apiService.login(credentials).subscribe(
        (response) => {
          if (response && response.access_token) {
            localStorage.setItem('itsLoged', 'true');
            localStorage.setItem('token', response.access_token);
            if (response.first_login) {
              localStorage.setItem('first_login', 'true');
              this.router.navigate(['/change_password']);
           
            } else {
              console.log(response)
              this.router.navigate(['/home']);
            }
          }
        },
        (error) => {
          this.errorMessage = error.error.error;
        }
      );
    }
  }
}

