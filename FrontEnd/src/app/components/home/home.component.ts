import { Component, NgModule, OnInit } from '@angular/core';
import { ApiRequestService } from 'src/app/services/api/api-request.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;
  employeeRole!: string;
  employee!: any;
  reportes: any[] = [];
  materials: any[] = [];
  empleado_id!: number;
  reportes_id: any[] = [];

  constructor(private ApiRequestService: ApiRequestService) {}

  ngOnInit(): void {
    this.getLoggedUser();
    this.obtenerReportes();
    this.obtenerCantidadMaterial();
    this.mostrarMaterialesDisponiblesBajos();
    this.obtenerReportesDelEmpleado();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    if (this.sidebarVisible) {
      this.sidebarWidth = 250; // Ancho del sidebar cuando es visible
    } else {
      this.sidebarWidth = 0; // Ancho del sidebar cuando es invisible
    }
  }

  obtenerReportes() {
    this.ApiRequestService.listReportes().subscribe(
      (response: any[]) => {
        
        this.reportes = response
        .filter(reporte => reporte.state === 'pending')
        .map(reporte => ({
          id: reporte.id,
          solicitud: reporte.petition,
          prioridad: reporte.priority,
          estado: reporte.state,
          type: reporte.type,
          empleado: reporte.employee_id,
          nameempleado: reporte.employee_name
          
        }));
      },
      error => {
        console.error('Error al obtener reportes:', error);
      }
    );
  }

  obtenerCantidadMaterial(){
    this.ApiRequestService.categoryMaterialInfo().subscribe(
      (response: any[]) => {
        this.materials = response.map(material => ({
          name: material.name, // Cambiar a category_name
          total_material: material.total_materials, // Cambiar a total_materials
          activeMaterial: material.active_materials, // Cambiar a active_materials
          availableMaterial: material.available_materials, // Cambiar a available_materials
          inactiveMaterial: material.inactive_materials // Cambiar a inactive_materials
        }));
      }
    );
  }

  mostrarMaterialesDisponiblesBajos() {
    // Filtrar los materiales con una cantidad disponible de menos de 5 unidades
    const materialesDisponiblesBajos = this.materials.filter(material => material.availableMaterial < 5);
    
    // Mostrar los materiales disponibles bajos en pantalla
    materialesDisponiblesBajos.forEach(material => {
        if (material.availableMaterial < 5) {
            console.log(`Quedan pocas unidades disponibles de ${material.name}: ${material.availableMaterial}`);
            // Aquí puedes agregar lógica adicional para mostrar en pantalla
        }
    });
}

getLoggedUser(): void {
  this.ApiRequestService.me().subscribe(
    (response: any) => {
      const roleId = response.role_id;
      this.empleado_id = response.id
     
      
      if (roleId === 1) {
        this.employeeRole = 'admin';
      } else if(roleId === 2){
        this.employee = response;
        this.employeeRole = 'manager';
      }
      else {
        this.employee = response;
        this.employeeRole = 'usuario';
      }
      this.obtenerReportesDelEmpleado();
    },
    error => {
      console.error('Error when obtaining data from the logged in user:', error);
    }
  );
}

obtenerReportesDelEmpleado() {

  this.ApiRequestService.listReportes().subscribe(
    (response: any[]) => {
      console.log(response);
      // Filtrar los reportes que ha hecho el empleado actual
      this.reportes_id = response.filter(reporte => reporte.employee_id === this.empleado_id)
        .map(reporte => ({
          id: reporte.id,
          estado: reporte.state,
          type: reporte.type,
          date: reporte.date // Corregido de 'data' a 'date'
        }));
    },
    error => {
      console.error('Error al obtener los reportes del empleado:', error);
    }
  );
}
  

}
