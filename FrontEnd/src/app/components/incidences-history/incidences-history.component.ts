import { Component, OnInit } from '@angular/core';
import { Employee } from 'src/app/model/Employee';
import { Incidence } from 'src/app/model/Incidence';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-incidences-history',
  templateUrl: './incidences-history.component.html',
  styleUrl: './incidences-history.component.css'
})

export class IncidenceHistoryComponent implements OnInit {
  employeeId!: number;
  employeeRole!: string;
  cargaDatos: boolean = true;
  userRole!: any;
  loggedInUser!: Employee | null;
  sucursales: { id: number; name: string; }[] = [];
  incidences!: Incidence[];
  incidenceSelect!: Incidence | null;

  constructor(private ApiRequestService: ApiRequestService,
    private authControlService: UsuariosControlService,) { }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(
      (user) => {
        this.loggedInUser = user;
      }
    );
    this.cargarOpciones();
    this.obtenerReportes();
  }
  cargarOpciones() {
    this.authControlService.cargarSucursales().subscribe(
      (sucursales) => {
        this.sucursales = sucursales;
      },
      (error) => {
        console.error('Error loading options', error);
      }
    );
  }

  obtenerReportes() {
    this.ApiRequestService.listIncidences().subscribe(
      (response: Incidence[]) => {
        this.incidences = response.filter((incidence: Incidence) => incidence.state === 'accepted' || incidence.state === 'rejected').sort((a, b) => a.id - b.id);;
        this.cargaDatos = false;
      },
      error => {
        console.error('Error al obtener reportes:', error);
      }
    );
  }

  mostrarDetalle(incidence: Incidence) {
    this.incidenceSelect = incidence;
  }

  cambiarEstadoReporte(idReporte: number, estado: string, event: any) {
    if (event) {
      const target = event.target as HTMLInputElement;
      if (target) {
        const isChecked = target.checked;

        const nuevoEstado = isChecked ? 'pending' : '';

        // Llamar al servicio API para cambiar el estado del reporte
        this.ApiRequestService.cambiarEstadoIncidencia(idReporte, nuevoEstado).subscribe(
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
    this.incidenceSelect = null;
    this.obtenerReportes();
  }
}
