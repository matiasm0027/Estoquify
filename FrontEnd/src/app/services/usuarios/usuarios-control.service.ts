import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from '../../../../node_modules/jwt-decode'; // Asegúrate de tener instalada la biblioteca jwt-decode

interface DecodedToken {
  exp: number; // Propiedad de fecha de expiración del token en segundos
  // Otras propiedades si son necesarias...
}

@Injectable({
  providedIn: 'root'
})

export class UsuariosControlService {
  private _successMessage = new BehaviorSubject<string>('');
  private usuarioSubject: BehaviorSubject<any>;
  public usuario: Observable<any>;
  usuarioSeleccionado: any;

  constructor() {
    //this.checkLocalStorage();
    this.usuarioSubject = new BehaviorSubject<any>(localStorage.getItem('token')); //comprueba el localStorage de token
    this.usuario = this.usuarioSubject.asObservable();

  }
 
  //
  public usuariData(): boolean {
    return this.usuarioSubject.value;
  }

  //cierra la sesion removiendo los tokens roles y usuario
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    this.usuarioSubject.next(false);
  }

  //guarda la localStorage de usuario logueado
  validarLogin(email: string): void {
    this.usuarioSubject.next(true);
    localStorage.setItem("user", email);
  }

}

