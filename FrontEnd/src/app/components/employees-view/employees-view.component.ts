import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-employees-view',
  templateUrl: './employees-view.component.html',
  styleUrls: ['./employees-view.component.css']
})

export class EmployeesViewComponent implements OnInit {
  page: number = 1;
  employees: any[] = [];
  empleadosFiltrados: any[] = [];
  mostrarModalAgregar: boolean = false;
  filtroSeleccionado: string = '';
  mostrarModalFiltros: boolean = false;
  formularioEmpleado: FormGroup;
  filtroDepartamento: string = '';
  filtroSucursal: string = '';
  departamentos: any[] = [];
  sucursales: any[] = [];
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;
  opcionesFiltro: { valor: string, etiqueta: string, seleccionado: boolean }[] = [
    { valor: 'departamento', etiqueta: 'Departamento', seleccionado: false },
    { valor: 'sucursal', etiqueta: 'Sucursal', seleccionado: false },
];

  constructor(private fb: FormBuilder, private peticionesService: ApiRequestService) {
    this.formularioEmpleado = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      departamento: ['', Validators.required],
      sucursal: ['', Validators.required],
      rol: ['', Validators.required],
      telefonoMovil: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerEmpleados();
    this.obtenerDepartamento();
    this.obtenerSucursales();
  }

  opcionSeleccionada(opcion: string): boolean {
    return this.opcionesFiltro.find(item => item.valor === opcion)?.seleccionado ?? false;
}
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    if (this.sidebarVisible) {
      this.sidebarWidth = 250; // Ancho del sidebar cuando es visible
    } else {
      this.sidebarWidth = 0; // Ancho del sidebar cuando es invisible
    }
  }

  obtenerDepartamento() {
    this.peticionesService.listDepartments().subscribe(
      (response: any[]) => {
        this.departamentos = response;
      },
      error => {
        console.error('Error al obtener department:', error);
      }
    );
  }

  obtenerSucursales() {
    this.peticionesService.listBranchOffices().subscribe(
      (response: any[]) => {
        this.sucursales = response;
      },
      error => {
        console.error('Error al obtener sucursales:', error);
      }
    );
  }

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.obtenerEmpleados();
    this.formularioEmpleado.reset();
  }

  mostrarModalDeFiltros(): void {
    this.mostrarModalFiltros = true;
  }

  cerrarModalDeFiltros(): void {
    this.mostrarModalFiltros = false;
  }


  aplicarFiltro(): void {
    this.empleadosFiltrados = this.employees.filter(empleado => {
      const filtroDepartamentoSeleccionado = this.opcionSeleccionada('departamento');
      const filtroSucursalSeleccionado = this.opcionSeleccionada('sucursal');
  
      if (filtroDepartamentoSeleccionado && filtroSucursalSeleccionado) {
        return empleado.department === this.filtroDepartamento && empleado.branch_office === this.filtroSucursal;
      } else if (filtroDepartamentoSeleccionado) {
        return empleado.department === this.filtroDepartamento;
      } else if (filtroSucursalSeleccionado) {
        return empleado.branch_office === this.filtroSucursal;
      } else {
        // Si no se selecciona ningún filtro, mostrar todos los empleados
        return true;
      }
    });
    
  }

  obtenerEmpleados() {
    this.peticionesService.listEmployees().subscribe(
      (response: any[]) => {
        this.employees = response;
        this.aplicarFiltro(); // Aplicar filtro cada vez que se obtienen nuevos datos
      },
      error => {
        console.error('Error al obtener empleados:', error);
      }
    );
  }

  agregarEmpleado() {
    if (this.formularioEmpleado.valid) {
      const nuevoEmpleado = this.formularioEmpleado.value;
      this.peticionesService.addEmployee(nuevoEmpleado).subscribe(
        (response: any) => {
          this.cerrarModal();
        },
        (error: any) => {
          console.error('Error al agregar empleado:', error);
        }
      );
    } else {
      console.error('Formulario inválido. Por favor, complete todos los campos requeridos.');
    }
  }
}
