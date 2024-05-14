import { Component, OnInit, Renderer2 } from '@angular/core';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{

  message!: string;
  employeeName!: string;
  roleId!:string;
  employeeRole!:string;
  isAdminManager: boolean = true;

  constructor(
    private authControlService: UsuariosControlService,
    private renderer: Renderer2,
    private apiRequest: ApiRequestService,
    ) {}

    ngOnInit(): void {
      this.getLoggedUser();
    }

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

    getLoggedUser(): void {
      this.apiRequest.me().subscribe(
        (response: any) => {
          this.employeeName = response.name + ' ' + response.last_name;
          const roleId = response.role_id;
     

          if (roleId === 1) {
            this.isAdminManager = true;
          } else if (roleId === 2){
            this.isAdminManager = true;
          } else if (roleId === 3){
            this.isAdminManager = false;
          }
        },
        error => {
        }
      );
    }
}
