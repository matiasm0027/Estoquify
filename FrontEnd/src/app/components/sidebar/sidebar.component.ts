import { Component, OnInit } from '@angular/core';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { Employee } from 'src/app/model/Employee';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  loggedInUser!: Employee | null;
  userRole!: any;
  showChatModal: boolean = false;

  constructor(private authControlService: UsuariosControlService) {
  }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(
      (user) => {
        this.loggedInUser = user;
      }
    );
  }

  logout(): void {
    this.authControlService.logout();
    window.location.reload();
  }

  toggleSidebar(): void {
    const sidebar = document.getElementById('logo-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('hidden');
    }
  }

  toggleChatModal() {
    this.showChatModal = !this.showChatModal;
  }
}
