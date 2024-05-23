import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Employee } from '../../model/Employee';
import { Role } from '../../model/Role';
import { Department } from '../../model/Department';
import { BranchOffice } from '../../model/BranchOffice';


@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {
  private apiUrl = 'http://localhost:8000/api';


  constructor(private http: HttpClient) {}

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials);
  }

  getLoggedInUser(): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/auth/getLoggedInUser`);
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/auth/listEmployees`);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/auth/getEmployee/${id}`);
  }

  refresh(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, {});
  }

  addEmployee(employeeData: Employee): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/addEmployee`, employeeData);
  }

  editEmployee(id: any, employeeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/editEmployee/${id}`, employeeData);
  }

  listDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/auth/listDepartments`);
  }

  listBranchOffices(): Observable<BranchOffice[]> {
    return this.http.get<BranchOffice[]>(`${this.apiUrl}/auth/listBranchOffices`);
  }

  listRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/auth/listRoles`);
  }

  listAtributos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/listAtributos`);
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

  getCategoriaDetails(categoryId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/categoryInfoAssignments/${categoryId}`);
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
    return this.http.get<any>(`${this.apiUrl}/auth/employeeInfoAssignments`);
  }

  agregarMaterial(nuevoMaterial: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/addMaterial`, nuevoMaterial);
  }

  deleteMaterial(materialId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/auth/deleteMaterial/${materialId}`);
  }

  editMaterial(materialId: number, materialData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/editMaterial/${materialId}`, materialData);
  }

  getMaterialDetails(materialId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/materialDetails/${materialId}`);
  }

  materialAsignado(materialId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/materialAssignedEmployees/${materialId}`);
  }

  desasignarMaterial(materialId: number, employee_id: number): Observable<any> {
    const requestBody = { employee_id: employee_id };
    return this.http.post<any>(`${this.apiUrl}/auth/desasignarMaterial/${materialId}`, requestBody);
  }

  asignarMaterial(materialId: number, employee_id: number): Observable<any> {
    const requestBody = { employee_id: employee_id };
    return this.http.post<any>(`${this.apiUrl}/auth/asignarMaterial/${materialId}`, requestBody);
  }

  agregarReporte(reporte: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/agregarReporte`, reporte);
  }

  cambiarEstadoReporte(idReporte: number, nuevoEstado: string): Observable<any> {
    const requestBody = { estado: nuevoEstado };
    return this.http.put<any>(`${this.apiUrl}/auth/changeReportStatus/${idReporte}`, requestBody);
  }

  listEmployeesByBranchOffice(id_branch_office : number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/listEmployeesByBranchOffice/${id_branch_office}`);
  }

  getFaqsDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/getFaqsDetails`);
  }

  createFaq(nuevaFaq: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/createFaq`, nuevaFaq);
  }

  deleteFaq(eliminarFaq: any) : Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/auth/deleteFaq`, eliminarFaq);
  }

  editFaq(faqID:number , faqData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/editFaq/${faqID}`, faqData);
  }

  crearConexion(nuevaConexion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/crearconexion`, nuevaConexion);
  }
  eliminarConexion(conexionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/auth/eliminarConexion/${conexionId}`);
  }

  getActiveChats(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/getActiveChats/${employeeId}`)
  }

  actualizarMensaje(chatId: number, nuevoMensaje: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/actualizarMensaje/${chatId}`, { message: nuevoMensaje });
  }
}
