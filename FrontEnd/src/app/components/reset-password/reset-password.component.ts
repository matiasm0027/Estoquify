import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiRequestService } from 'src/app/services/api/api-request.service'; // Elimina la extensión .js

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
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
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],

    });

    route.queryParams.subscribe(params => {
      this.resetToken = params['token']
    });
  }

  submitResetPassword(): void {
    if (this.resetPasswordForm.valid) {
      const email = this.resetPasswordForm.value.email;
      const newPassword = this.resetPasswordForm.value.newPassword;
      const confirmPassword = this.resetPasswordForm.value.confirmPassword;

      if (newPassword !== confirmPassword) {
        this.passwordsMatchError = true;
        return;
      }
      console.log('antes de la llegada wuapos')
      this.apiService.resetPassword(email, newPassword, confirmPassword, this.resetToken).subscribe(
        (response) => {
          console.log(response+'llegamos wuapos')
          this.router.navigate(['/login']);
        },
        (error) => {
          this.errorMessage = error.error.error;
        }
      );
    }
  }
}
