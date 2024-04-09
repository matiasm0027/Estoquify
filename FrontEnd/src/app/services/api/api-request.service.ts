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
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // Client-side error
            console.error('An error occurred:', error.error.message);
          } else {
            // Server-side error
            console.error(
              `Backend returned code ${error.status}, ` +
              `body was: ${JSON.stringify(error.error)}`
            );
          }
          // Throw a custom error or return an observable with a user-friendly error message
          return throwError('Invalid credentials. Please try again.');
        })
      );
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
}
