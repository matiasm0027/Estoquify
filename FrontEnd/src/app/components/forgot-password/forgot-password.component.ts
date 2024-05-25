import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private apiService: ApiRequestService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.changePasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),]],
    });
  }

  ngOnInit(): void {
    // Check if the user is already logged in based on the presence of an item in local storage
    if (localStorage.getItem('itsLoged')) {
        // If the user is logged in, redirect them to the home page
        this.router.navigate(['/home']);
    }
}


submitResetPassword(): void {
  // Check if the change password form is valid
  if (this.changePasswordForm.valid) {
      // Get the value of the email field
      const emailValue = this.changePasswordForm.value.email;

      // After verifying the email, if it's valid, send the password reset request
      this.apiService.resetPasswordRequest(emailValue).subscribe(
          (response) => {
              // If the request is successful, set the success message and clear the error message
              this.successMessage = response.message;
              this.errorMessage = "";
          },
          (error) => {
              // If there's an error, set the error message
              this.errorMessage = error.error.error;
          }
      );
  }
}

}
