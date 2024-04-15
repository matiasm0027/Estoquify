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
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('itsLoged')) {
      this.router.navigate(['/home']);
    }
  }

  submitResetPassword(): void {
    if (this.changePasswordForm.valid) {
      const emailValue = this.changePasswordForm.value.email; // Obtener el valor del campo email

      this.apiService.resetPasswordRequest(emailValue).subscribe(
        (response) => {
          this.successMessage = response.message;
          this.errorMessage= "";
        },
        (error) => {
          this.errorMessage = error.error.error;
        }
      );
    }
  }
}
