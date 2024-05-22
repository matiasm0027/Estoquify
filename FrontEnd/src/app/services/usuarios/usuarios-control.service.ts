import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
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
  usuarioSeleccionado: any;
  private loggedInUser!: Employee;

  constructor(private ApiRequestService: ApiRequestService) {
    this.getLoggedUser();
  }

  getLoggedUser(): Observable<Employee> {
    return this.ApiRequestService.getLoggedInUser().pipe(
      tap(response => {
        this.loggedInUser = response;

      }),
      catchError(error => {
        console.error(error);
        return EMPTY;
      })
    );
  }

  getStoredLoggedInUser(): Employee | null {
    return this.loggedInUser;
  }

  cargarRoles() {
    return this.ApiRequestService.listRoles();
  }

  cargarDepartamentos() {
    return this.ApiRequestService.listDepartments();
  }

  cargarSucursales() {
    return this.ApiRequestService.listBranchOffices();
  }

  cargarAtributos() {
    return this.ApiRequestService.listAtributos();
  }

  hasRole(): any {
    return localStorage.getItem('rol');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('itsLoged');
  }
}
