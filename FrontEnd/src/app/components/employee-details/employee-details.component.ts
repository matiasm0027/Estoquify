import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})
export class EmployeeDetailsComponent implements OnInit {
  employeeId!: number;
  employeeDetails: any = {};
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;

  constructor(private route: ActivatedRoute, private employeeService: ApiRequestService) { }

  ngOnInit(): void {
    this.getEmployeeIdFromRoute();
    this.getEmployeeDetails();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    if (this.sidebarVisible) {
      this.sidebarWidth = 250; // Ancho del sidebar cuando es visible
    } else {
      this.sidebarWidth = 0; // Ancho del sidebar cuando es invisible
    }
  }

  getEmployeeIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.employeeId = +params['id']; // Obtener el id del empleado de la ruta
      console.log(this.employeeId)
    });
  }

  getEmployeeDetails(): void {
    this.employeeService.getEmployeeDetails(this.employeeId)
      .subscribe(
        (employee: any) => {
          this.employeeDetails = employee;
          console.log(employee)
           // Verifica los detalles del empleado en la consola
        },
        (error: any) => {
          console.error('Error al obtener detalles del empleado:', error);
        }
      );
      
  }
}

