import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsuariosControlService } from '../usuarios/usuarios-control.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private usuariosControlService: UsuariosControlService) {}

  //peticiones para la api

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials);
  }

  logout(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/logout`);
  }

  getUserDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user-details`, {
    });
  }

  obtenerEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employees`);
  }

  crearEmpleado(empleado: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/employees`, empleado);
  }

  actualizarEmpleado(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/employees/${id}`, datos);
  }

  eliminarEmpleado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employees/${id}`);
  }
  verificarCampo(tipo: string, valor: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verificar/${tipo}/${valor}`);
  }
}
