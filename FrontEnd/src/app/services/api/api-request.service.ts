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
    return this.http.put<any>(`${this.apiUrl}/auth/editEmployee/${id}`, employeeData);
  }

  listDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/listDepartments`);
  }

  listBranchOffices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/listBranchOffices`);
  }

  listReportes(): Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/auth/listReports`);
  }

  categoryMaterialInfo(): Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/auth/categoryMaterialInfo`);
  }

  changePassword(newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/changePassword`, { newPassword, confirmPassword });
  }

  getEmployeeDetails(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/employeeInfoAssignments/${employeeId}`);
  }

  deleteEmployees(id: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/auth/deleteEmployee/${id}`);
  }

  resetPasswordRequest(email: string): Observable<any> {
    const requestBody = { email: email };
    return this.http.post<any>(`${this.apiUrl}/auth/resetPasswordRequest`, requestBody);
  }

  resetPassword(email: string, newPassword: string, confirmPassword: string, resetToken: string): Observable<any> {
    const requestData = {
      email: email,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
      resetToken: resetToken
    };
    return this.http.post<any>(`${this.apiUrl}/auth/resetPassword`, requestData);
  }

  getCategoryDetails(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/employeeInfoAssignments/${employeeId}`);
  }

  addCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/addCategory`, category);
  }

  editCategory(id: any, category: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/editCategory/${id}`, category);
  }

  deleteCategory(id: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/auth/deleteCategory/${id}`);
  }

  MaterialDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/employeeInfoAssignments/$`);
  }
}
