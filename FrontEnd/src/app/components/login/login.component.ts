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
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if 'itsLoged' item exists in local storage
    if (localStorage.getItem('itsLoged')) {
      // If 'itsLoged' exists, navigate the user to the '/home' route
      this.router.navigate(['/home']);
    }
  }
  

  enviarLogin(): void {
    // Check if the login form is valid
    if (this.loginForm.valid) {
        // Extract email and password from the form
        const credentials = {
            email: this.loginForm.value.email,
            password: this.loginForm.value.password
        };

        // Send a login request to the API with the extracted credentials
        this.apiService.login(credentials).subscribe(
            (response) => {
                // If the response contains an access token
                if (response && response.access_token) {
                    // Store login status and token in local storage
                    localStorage.setItem('itsLoged', 'true');
                    localStorage.setItem('token', response.access_token);
                    localStorage.setItem('rol', response.rol);
                    localStorage.setItem('first_login', response.first_login);
                    
                    // If it's the user's first login, navigate them to the change password page
                    if (localStorage.getItem('first_login') === '1') {
                        this.router.navigate(['/change_password']);
                    } else {
                        // Otherwise, navigate them to the home page
                        this.router.navigate(['/home']);
                    }
                }
            },
            (error) => {
                // If there's an error, display the error message
                this.errorMessage = error.error.error;
            }
        );
    }
}


}

