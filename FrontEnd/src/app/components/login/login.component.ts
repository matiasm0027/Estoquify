import { Component, OnInit } from '@angular/core';
import './custom.js';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
    // Check if user is already authenticated (optional)
    // If so, redirect to a different page
    if (localStorage.getItem('token')) {
      this.router.navigate(['/home']); // Example: Redirect to dashboard
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
          // Check if response contains access_token
          if (response && response.access_token) {
            // Save token to local storage
            localStorage.setItem('token', response.access_token);

            // Redirect to home page or desired route
            this.router.navigate(['/home']); // Adjust '/home' to your desired route
          } else {
            // Handle unexpected response format
            console.error('Unexpected response format:', response);
            this.errorMessage = 'Unexpected response from server.';
          }
        },
        (error) => {
          this.errorMessage = error.error.error; // Assuming Laravel sends error messages like this
        }
      );
    }
  }
}

