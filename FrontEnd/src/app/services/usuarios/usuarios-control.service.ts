import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError, tap } from 'rxjs';
import { ApiRequestService } from '../api/api-request.service';
import { Employee } from 'src/app/model/Employee';

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
  private numero!: number;
  private loggedInUser!: Employee;

  constructor(private ApiRequestService: ApiRequestService) {
    //this.checkLocalStorage();
    this.usuarioSubject = new BehaviorSubject<any>(localStorage.getItem('token')); //comprueba el localStorage de token
    this.usuario = this.usuarioSubject.asObservable();

  }

  getLoggedUser(): Observable<any> {
    return this.ApiRequestService.getLoggedInUser().pipe(
      tap(response => this.loggedInUser = response),
      catchError(error => {
        console.error(error);
        return EMPTY;
      })
    );
  }

  getStoredLoggedInUser(): Employee {
    return this.loggedInUser;
  }

  hasRole(): any {
    return localStorage.getItem('rol');
  }

  setNumero(valor: number) {
    this.numero = valor;
  }

  getNumero(): number {
    return this.numero;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('itsLoged');
  }
}

