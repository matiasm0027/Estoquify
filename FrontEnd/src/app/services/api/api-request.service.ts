import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials);
  }

  me(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`);
  }

  refresh(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, {});
  }

  listEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/listEmployees`);
  }

  addEmployee(employeeData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/addEmployee`, employeeData);
  }

  editEmployee(id: any, employeeData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/editEmployee/${id}`, employeeData);
  }

  deleteEmployee(id: any, employeeData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/deleteEmployee/${id}`, employeeData);
  }

  listDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/listDepartments`);
  }

  listBranchOffices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/listBranchOffices`);
  }
}
