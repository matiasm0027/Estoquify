import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface DecodedToken {
  exp: number; // Propiedad de fecha de expiración del token en segundos
  // Otras propiedades si son necesarias...
}

@Injectable({
  providedIn: 'root'
})

export class UsuariosControlService {
  private usuarioSubject: BehaviorSubject<any>;
  public usuario: Observable<any>;
  usuarioSeleccionado: any;

  constructor() {
    //this.checkLocalStorage();
    this.usuarioSubject = new BehaviorSubject<any>(localStorage.getItem('token')); //comprueba el localStorage de token
    this.usuario = this.usuarioSubject.asObservable();

  }
}

