import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  message!: string;

  constructor(
    private authService: ApiRequestService,
    private authControlService: UsuariosControlService,
    private router: Router
    ) {}

    logout(): void {
      this.authControlService.logout();
      this.authService.logout().subscribe(
        response => {
          this.router.navigate(['/login']);
        },
      );
    }
}
