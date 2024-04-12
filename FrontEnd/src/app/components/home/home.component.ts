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


  reportes: any[] = [];

  constructor(private ApiRequestService: ApiRequestService) {}

  ngOnInit(): void {
    this.obtenerReportes();
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
        this.reportes = response.map(reporte => ({
          id: reporte.id,
          fecha: reporte.date,
          estado: reporte.state,
          empleado: reporte.employee_id
        }));
      },
      error => {
        console.error('Error al obtener reportes:', error);
      }
    );
  }

}
