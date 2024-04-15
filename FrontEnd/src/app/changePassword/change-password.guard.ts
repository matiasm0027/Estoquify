import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordGuard implements CanActivate {

  constructor(
    private router: Router
  ) {}

  canActivate(): boolean {
    const firstLogin = localStorage.getItem('first_login');
    console.log(firstLogin)
    if (!firstLogin) {
      return true; // Permite la navegación
    } else {
      console.log(firstLogin+'hola')
      this.router.navigate(['/change_password']); // Redirige a la página de cambio de contraseña
      return false; // Bloquea la navegación
    }
  }
}
