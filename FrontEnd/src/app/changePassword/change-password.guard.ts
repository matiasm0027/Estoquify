import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordGuard implements CanActivate {

  constructor(
    private router: Router
  ) { }

  // This method determines whether or not the route can be activated.
  canActivate(): boolean {
    // Check if it's the user's first login by retrieving the 'first_login' flag from local storage.
    const firstLogin = localStorage.getItem('first_login');

    // If 'first_login' is '1', redirect the user to the '/change_password' route.
    if (firstLogin === '1') {
      this.router.navigate(['/change_password']);
      return false;
    }

    // If 'first_login' is '0' or not set, allow access to the route.
    return true;
  }
}
