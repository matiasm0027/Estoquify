import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UsuariosControlService } from '../usuarios/usuarios-control.service';

interface LoginResponse {
  token: string;
  user: { id: number; role: string };
}

@Injectable({
  providedIn: 'root'
})

export class PeticionesService {
  //ruta de la api de laravel
  private baseURL = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private usuariosControlService: UsuariosControlService) {}

  //peticiones para la api

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseURL}/login`, { email, password }).pipe(
      tap((response: LoginResponse) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role_id', response.user.role);
          this.usuariosControlService.validarLogin(email); // Informar al servicio de control de usuarios
        }
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getUserDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/user-details`, {
    });
  }

  obtenerEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/employees`);
  }

  crearEmpleado(empleado: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/employees`, empleado);
  }

  actualizarEmpleado(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseURL}/employees/${id}`, datos);
  }

  eliminarEmpleado(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/employees/${id}`);
  }
  verificarCampo(tipo: string, valor: string): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/verificar/${tipo}/${valor}`);
  }
}



