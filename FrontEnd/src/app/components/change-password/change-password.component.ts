import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import './custom.js';
import { ApiRequestService } from 'src/app/services/api/api-request.service'; // Importing API request service
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service'; // Importing user control service

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],

})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  errorMessage: string | null = null;
  employeeId!: string;
  passwordsMatchError = false;

  constructor(
    private authControlService: UsuariosControlService,
    private apiService: ApiRequestService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // Initializing the change password form with form controls and validators
    this.changePasswordForm = this.formBuilder.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Redirecting to home page if it's not the first login (checking local storage)
    if (!localStorage.getItem('first_login')) {
      this.router.navigate(['/home']);
    }
  }

  // Function to submit the change password form
  submitChangePassword(): void {
    if (this.changePasswordForm.valid) {
      const newPassword = this.changePasswordForm.value.newPassword;
      const confirmPassword = this.changePasswordForm.value.confirmPassword;

      if (newPassword !== confirmPassword) {
        this.passwordsMatchError = true;
        return;
      }

      this.apiService.changePassword(newPassword, confirmPassword).subscribe(
        (response) => {
          this.authControlService.logout();
          localStorage.removeItem('first_login');
          window.location.reload();
        },
        (error) => {
          this.errorMessage = error.error.error;
        }
      );
    }
  }
}

