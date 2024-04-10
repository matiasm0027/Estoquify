import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
//https://codingpotions.com/angular-seguridad
export class MyGuardGuard implements CanActivate {
  constructor(
    private router : Router,
    ){
  }
  canActivate():any {
    if (localStorage.getItem('token')) {
      return true;
    }
    this.router.navigate(['/login']);
      return false;
  }
}
