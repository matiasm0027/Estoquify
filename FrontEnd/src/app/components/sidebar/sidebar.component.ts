import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  message!: string;

  constructor(
    private authControlService: UsuariosControlService,
    private router: Router
    ) {}

    logout(): void {
      this.authControlService.logout();
      this.router.navigate(['/login']);
    }
}
