import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiRequestService } from 'src/app/services/api/api-request.service'; // Elimina la extensión .js

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit{
  resetPasswordForm: FormGroup;
  errorMessage: string | null = null;
  resetToken!: string;
  passwordsMatchError = false;

  constructor(
    private apiService: ApiRequestService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),]],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],

    });

    route.queryParams.subscribe(params => {
      this.resetToken = params['token']
    });
  }

 // Initialize component
ngOnInit(): void {
  // Check if there is no reset token
  if (!this.resetToken){
    // Redirect to the login page if there is no reset token
    this.router.navigate(['/login']);
  }
}

// Function to submit reset password form
submitResetPassword(): void {
  // Check if the reset password form is valid
  if (this.resetPasswordForm.valid) {
    // Extract email, new password, and confirm password from the form
    const email = this.resetPasswordForm.value.email;
    const newPassword = this.resetPasswordForm.value.newPassword;
    const confirmPassword = this.resetPasswordForm.value.confirmPassword;

    // Check if the new password matches the confirm password
    if (newPassword !== confirmPassword) {
      // Set passwords match error flag to true and exit the function
      this.passwordsMatchError = true;
      return;
    }
    // Call the API service to reset the password
    this.apiService.resetPassword(email, newPassword, confirmPassword, this.resetToken).subscribe(
      // Handle successful response
      (response) => {
        // Redirect to the login page after password reset
        this.router.navigate(['/login']);
      },
      // Handle error response
      (error) => {
        // Set error message to display the error to the user
        this.errorMessage = error.error.error;
      }
    );
  }
}

}
