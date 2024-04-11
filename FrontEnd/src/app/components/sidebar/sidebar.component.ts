import { Component, Renderer2 } from '@angular/core';
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
    private renderer: Renderer2
    ) {}

    logout(): void {
      this.authControlService.logout();
      window.location.reload();
    }
    toggleSidebar(): void {
      const sidebar = document.getElementById('logo-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('hidden'); // Agrega o quita la clase 'hidden'
      }
    }
}
