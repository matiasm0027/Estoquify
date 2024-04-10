import { Component } from '@angular/core';
import { UsuariosControlService } from '../../services/usuarios/usuarios-control.service';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-employee-view',
  templateUrl: './employee-view.component.html',
  styleUrls: ['./employee-view.component.css']
})

export class EmployeeViewComponent {
  employees: any[] = [];
  mostrarModalAgregar: boolean = false;
  filtroSeleccionado: string = 'departamento';
  mostrarModalFiltros: boolean = false;

  constructor(private peticionesService: ApiRequestService, private sincro: UsuariosControlService) {}

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  // Método para cerrar el modal
  cerrarModal() {
    this.mostrarModalAgregar = false;
  }
  mostrarModalDeFiltros(): void {
    this.mostrarModalFiltros = true;
}

cerrarModalDeFiltros(): void {
    this.mostrarModalFiltros = false;
}

  aplicarFiltro(): void {
    // Aquí implementa la lógica para aplicar el filtro seleccionado
    // Puedes acceder al filtro seleccionado con this.filtroSeleccionado
}
  // ngOnInit(): void {
  //   this.obtenerEmpleados();
  // }

//   esAdmin(): boolean {
//     return this.sincro.getUserRole() === 'admin';
//   }

//   obtenerEmpleados() {
//     this.peticionesService.obtenerEmpleados().subscribe(
//       (data: any[]) => {
//         this.employees = data.map(employee => ({ ...employee, message: '' }));
//       },
//       error => {
//         this.message = error.message;
//       }
//     );
//   }
 }