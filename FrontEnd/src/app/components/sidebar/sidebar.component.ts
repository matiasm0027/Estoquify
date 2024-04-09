import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  message!: string;

  constructor(
    private authService: ApiRequestService,
    private router: Router
    ) {}

  logout(): void {
    this.authService.logout().subscribe(
      response => {
        this.router.navigate(['/login']);
        this.message = response.message;
        console.log(response.message)
        console.log(response)
      },
      error => {
        console.error('Logout error:', error);
        console.log(error)
        this.message = 'Logout failed';
      }
    );
  }
}
