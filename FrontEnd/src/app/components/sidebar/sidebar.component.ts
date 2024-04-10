import { Component } from '@angular/core';
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
    ) {}

    logout(): void {
      this.authControlService.logout();
      window.location.reload();
    }
}
