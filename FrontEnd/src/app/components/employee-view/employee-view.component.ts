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
  nuevoEmpleado: any = {
    nombre: '',
    apellido: '',
    departamento: '',
    sucursal: '',
    email: '',
    password: '',
    rol: ''
  };

  constructor(private peticionesService: ApiRequestService, private sincro: UsuariosControlService) {}

  ngOnInit(): void {
    this.obtenerEmpleados();
  }

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  cerrarModal() {
    this.mostrarModalAgregar = false;
    // Limpiar el objeto nuevoEmpleado para el próximo uso
    this.nuevoEmpleado = {
      nombre: '',
      apellido: '',
      departamento: '',
      sucursal: '',
      email: '',
      password: '',
      rol: ''
    };
  }

  mostrarModalDeFiltros(): void {
    this.mostrarModalFiltros = true;
  }

  cerrarModalDeFiltros(): void {
    this.mostrarModalFiltros = false;
  }

  aplicarFiltro(): void {
    // Implementa la lógica para aplicar el filtro seleccionado
    // Puedes acceder al filtro seleccionado con this.filtroSeleccionado
  }

  obtenerEmpleados() {
    this.peticionesService.listEmployees().subscribe(
      (response: any[]) => {
        this.employees = response;
        console.log(response);
      },
      error => {
        console.error('Error al obtener empleados:', error);
      }
    );
  }

  agregarEmpleado() {
    this.peticionesService.addEmployee(this.nuevoEmpleado).subscribe(
      (response: any) => {
        // Agregar el nuevo empleado a la lista actual
        this.employees.push(response);
        console.log('Empleado añadido con éxito:', response);
        // Cerrar el modal después de agregar el empleado
        this.cerrarModal();
      },
      (error: any) => {
        console.error('Error al agregar empleado:', error);
        // Manejar los errores que puedan ocurrir durante la solicitud al servidor
        // Aquí puedes mostrar un mensaje de error al usuario si es necesario
      }
    );
  }
}
