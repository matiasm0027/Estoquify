import { Component } from '@angular/core';
import './custom.js';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']

})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage!: string;

  constructor(
    private fb: FormBuilder,
    private authService: ApiRequestService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Inicializar el formulario
  }

  enviarLogin(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(
        response => {
          // Manejar la respuesta exitosa
          this.router.navigate(['/home']);
        },
        error => {
          // Manejar errores de autenticación
          if (error.status === 401) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'An unexpected error occurred';
          }
        }
      );
    }
  }
}
