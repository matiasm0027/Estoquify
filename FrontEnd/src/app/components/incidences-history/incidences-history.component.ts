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
      // Get the role of the user from the authentication control service
      this.userRole = this.authControlService.hasRole();
  
      // Get the logged-in user from the authentication control service
      this.authControlService.getLoggedUser().subscribe(
          (user) => {
              // Store the logged-in user
              this.loggedInUser = user;
          }
      );
  
      // Load options and fetch reports when the component initializes
      this.cargarOpciones();
      this.obtenerReportes();
  }


 cargarOpciones() {
    // Load options for branch offices from the authentication control service
    this.authControlService.cargarSucursales().subscribe(
        (sucursales) => {
            // Store the loaded branch offices in the sucursales array
            this.sucursales = sucursales;
        },
        (error) => {
            // Log any errors that occur while loading options
            console.error('Error loading options', error);
        }
    );
}

obtenerReportes() {
    // Get the list of incidences from the API
    this.ApiRequestService.listIncidences().subscribe(
        (response: Incidence[]) => {
            // Filter the incidences to include only those with state 'accepted' or 'rejected', and sort them by ID
            this.incidences = response.filter((incidence: Incidence) => incidence.state === 'accepted' || incidence.state === 'rejected').sort((a, b) => a.id - b.id);
            // Set cargaDatos to false after the data has been loaded
            this.cargaDatos = false;
        },
        error => {
            // Log any errors that occur while fetching reports
            console.error('Error al obtener reportes:', error);
        }
    );
}

mostrarDetalle(incidence: Incidence) {
    // Set the selected incidence to show its details
    this.incidenceSelect = incidence;
}

cambiarEstadoReporte(idReporte: number, estado: string, event: any) {
    if (event) {
        const target = event.target as HTMLInputElement;
        if (target) {
            const isChecked = target.checked;

            // Determine the new state based on whether the checkbox is checked
            const nuevoEstado = isChecked ? 'pending' : '';

            // Call the API service to change the state of the report
            this.ApiRequestService.cambiarEstadoIncidencia(idReporte, nuevoEstado).subscribe(
                (response: any) => {
                    // Handle the response from the service if necessary
                },
                (error: any) => {
                    // Log any errors that occur while changing the report state
                    console.error('Error al cambiar el estado del reporte:', error);
                    // Handle the service error if necessary
                }
            );
        }
    }
}

cerrarModal() {
    // Clear the selected incidence and refresh the list of reports
    this.incidenceSelect = null;
    this.obtenerReportes();
}

}
