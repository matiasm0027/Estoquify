import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../../model/Employee';
import { Role } from '../../model/Role';
import { Department } from '../../model/Department';
import { BranchOffice } from '../../model/BranchOffice';
import { Attribute } from 'src/app/model/Attribute';
import { Category } from 'src/app/model/Category';
import { Material } from 'src/app/model/Material';
import { Incidence } from 'src/app/model/Incidence';


@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {
  private apiUrl = 'https://estoquify.es/api';

  constructor(private http: HttpClient) {}

  //credenciales
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials);
  }

  changePassword(newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/changePassword`, { newPassword, confirmPassword });
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


  //listar a si mismo
  getLoggedInUser(): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/auth/getLoggedInUser`);
  }

  //listar empleados
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/auth/listEmployees`);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/auth/getEmployee/${id}`);
  }

  addEmployee(employeeData: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/auth/addEmployee`, employeeData);
  }

  editEmployee(id: any, employeeData: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/auth/editEmployee/${id}`, employeeData);
  }

  deleteEmployees(id: any): Observable<Employee> {
    return this.http.delete<Employee>(`${this.apiUrl}/auth/deleteEmployees/${id}`);
  }


  //listado de tablas genericas
  listDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/auth/listDepartments`);
  }

  listBranchOffices(): Observable<BranchOffice[]> {
    return this.http.get<BranchOffice[]>(`${this.apiUrl}/auth/listBranchOffices`);
  }

  listRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/auth/listRoles`);
  }

  listAtributos(): Observable<Attribute[]> {
    return this.http.get<Attribute[]>(`${this.apiUrl}/auth/listAtributos`);
  }


  //lista de categoria
  categoryMaterial(): Observable<Category[]>{
    return this.http.get<Category[]>(`${this.apiUrl}/auth/categoryMaterial`);
  }

  categoryMaterialInfo(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/auth/categoryMaterialInfo/${id}`);
  }

  addCategory(category: any): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/auth/addCategory`, category);
  }

  editCategory(id: any, category: any): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/auth/editCategory/${id}`, category);
  }

  deleteCategory(id: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/auth/deleteCategory/${id}`);
  }

  //listado material
  getMaterial(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/auth/getMaterial/${id}`);
  }

  agregarMaterial(nuevoMaterial: Material): Observable<Material> {
    return this.http.post<Material>(`${this.apiUrl}/auth/addMaterial`, nuevoMaterial);
  }

  deleteMaterial(materialId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/auth/deleteMaterial/${materialId}`);
  }

  editMaterial(materialId: number, materialData: any): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/auth/editMaterial/${materialId}`, materialData);
  }

  getMaterialDetails(materialId: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/auth/materialDetails/${materialId}`);
  }

  desasignarMaterial(id: any, employee_id: any): Observable<any> {
    const requestBody = { id: employee_id };
    return this.http.post<any>(`${this.apiUrl}/auth/desasignarMaterial/${id}`, requestBody);
  }

  asignarMaterial(id: number, employee_id: number): Observable<any> {
    const requestBody = { id: employee_id };
    return this.http.post<any>(`${this.apiUrl}/auth/asignarMaterial/${id}`, requestBody);
  }

  //lista de incidencias
  listIncidences(): Observable<Incidence[]>{
    return this.http.get<Incidence[]>(`${this.apiUrl}/auth/listIncidences`);
  }

  addIncidence(incidence: Incidence): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/addIncidence`, incidence);
  }

  cambiarEstadoIncidencia(idReporte: number, nuevoEstado: string): Observable<any> {
    const requestBody = { estado: nuevoEstado };
    return this.http.put<any>(`${this.apiUrl}/auth/changeIncidenceStatus/${idReporte}`, requestBody);
  }

  listEmployeesByBranchOffice(id_branch_office : number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/listEmployeesByBranchOffice/${id_branch_office}`);
  }

  getEmployeesByBranchOffice(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/getEmployeesByBranchOffice`);
  }


  getFaqsDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/getFaqsDetails`);
  }

  createFaq(nuevaFaq: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/createFaq`, nuevaFaq);
  }

  deleteFaq(eliminarFaq: number) : Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/auth/deleteFaq/${eliminarFaq}`);
  }

  editFaq(FaqID:number , faqData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/editFaq/${FaqID}`, faqData);
  }

  crearConexion(nuevaConexion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/crearconexion`, nuevaConexion);
  }
  eliminarConexion(Id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/auth/eliminarConexion/${Id}`);
  }

  getActiveChats(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/getActiveChats/${employeeId}`)
  }

  actualizarMensaje(chatId: number, nuevoMensaje: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/actualizarMensaje/${chatId}`, { message: nuevoMensaje });
  }
}
