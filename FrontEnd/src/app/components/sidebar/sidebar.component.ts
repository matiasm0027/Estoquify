import { Component, OnInit } from '@angular/core';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { Employee } from 'src/app/model/Employee';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  loggedInUser: Employee | null = null; // Inicializar con un valor nulo
  userRole!: any;
  
   
  constructor(private authControlService: UsuariosControlService,  private apiRequestService: ApiRequestService) {}

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(() => {
      this.loggedInUser = this.authControlService.getStoredLoggedInUser();
    });
    
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



}
