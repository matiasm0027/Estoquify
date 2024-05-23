import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MyGuardGuard implements CanActivate {

  constructor(private router: Router) { }

  // This method determines whether or not the route can be activated.
  canActivate(): boolean {
    // Check if a token exists in local storage.
    const token = localStorage.getItem('token');
    // If a token exists, allow navigation to the route.
    if (token) {
      return true;
    } else {
      // If no token exists, redirect to the login page and deny navigation.
      this.router.navigate(['/login']);
      return false;
    }
  }

}
