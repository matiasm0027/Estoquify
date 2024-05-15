import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-reportes-history',
  templateUrl: './reportes-history.component.html',
  styleUrl: './reportes-history.component.css'
})

export class ReportesHistoryComponent implements OnInit, OnDestroy{
  reportes: any[] = [];
  reporteSeleccionado: any = null;
  sucursales: any[] = [];
  employeeId!: number;
  employeeRole!: string;
  cargaDatos: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(private apiRequestService: ApiRequestService) {}

  ngOnInit(): void {
    this.getLoggedUser()
    this.obtenerReportes();
    this.obtenerSucursales();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getLoggedUser(): void {
    this.apiRequestService.getLoggedInUser().subscribe(
      (response: any) => {
        this.employeeId = response.id;
        const roleId = response.role_id;
        if (roleId === 1) {
          this.employeeRole = 'admin';
        } else if (roleId === 2) {
          this.employeeRole = 'manager';
        } else if (roleId === 3) {
          this.employeeRole = 'user';
        }
        this.cargaDatos = false;
      },
      error => {
        console.error('Error when obtaining data from the logged in user:', error);
      }
    );
  }
  obtenerReportes() {
    this.apiRequestService.listReportes().subscribe(
      (response: any[]) => {
        this.reportes = response.filter(reporte => reporte.state === 'accepted' || reporte.state === 'rejected')
          .map(reporte => ({
            id: reporte.id,
            solicitud: reporte.petition,
            prioridad: reporte.priority,
            estado: reporte.state,
            type: reporte.type,
            nameempleado: reporte.employee_name,
            sucursalid: reporte.employee_id_sucursal,
          }));
          this.cargaDatos = false;

      },
      error => {
        console.error('Error al obtener reportes:', error);
      }
    );
  }

  mostrarDetalle(reporte: any) {
    this.reporteSeleccionado = reporte;
  }

  obtenerSucursales() {
    this.apiRequestService.listBranchOffices().subscribe(
      (response: any[]) => {
        this.sucursales = response;
        this.cargaDatos = false;

      },
      error => {
        console.error('Error al obtener sucursales:', error);
      }
    );
  }

  obtenerNombreSucursal(sucursalId: number): string {
    const sucursal = this.sucursales.find(sucursal => sucursal.id === sucursalId);
    return sucursal ? sucursal.name : ''; // Devuelve el nombre de la sucursal si se encuentra, de lo contrario devuelve una cadena vacía
  }

  cambiarEstadoReporte(idReporte: number, estado: string, event: any) {
    if (event) {
        const target = event.target as HTMLInputElement;
        if (target) {
            const isChecked = target.checked;

            const nuevoEstado = isChecked ? 'pending' : '';

            // Llamar al servicio API para cambiar el estado del reporte
            this.apiRequestService.cambiarEstadoReporte(idReporte, nuevoEstado).subscribe(
                (response: any) => {
                    console.log('Estado del reporte cambiado:', response);
                    // Manejar la respuesta del servicio si es necesario
                },
                (error: any) => {
                    console.error('Error al cambiar el estado del reporte:', error);
                    // Manejar el error del servicio si es necesario
                }
            );
        }
    }
}

  cerrarModal() {
    this.reporteSeleccionado = null;
    this.obtenerReportes();
  }
}
