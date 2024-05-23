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
    // Si first_login es 'true', redirige a /change_password
    if (firstLogin === '1') {
      this.router.navigate(['/change_password']);
      return false;
    }
    // Si first_login es 'false', permite el acceso
    return true;
  }
}
