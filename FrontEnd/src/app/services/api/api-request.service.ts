import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials)
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, {});
  }

  me(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`);
  }

  refresh(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, {});
  }

  listEmployees(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/listEmployees`);
  }
}
