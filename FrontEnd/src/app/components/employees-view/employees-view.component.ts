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
  filtroSeleccionado: string = 'quitar';
  mostrarModalFiltros: boolean = false;
  formularioEmpleado: FormGroup;
  filtroDepartamento: string = '';
  filtroSucursal: string = '';
  departamentos = [
    { label: 'Computing', value: '1' },
    { label: 'Billing', value: '2' },
    { label: 'Accounting', value: '3' },
    { label: 'Finance', value: '4' },
    { label: 'Commercial', value: '5' },
    { label: 'Sac', value: '6' },
    { label: 'Shopping', value: '7' },
    { label: 'Logistics', value: '8' }
  ];
  sucursales = [
    { label: 'Barcelona', value: '1' },
    { label: 'Madrid', value: '2' },
    { label: 'Gerona', value: '3' },
    { label: 'Tarragona', value: '4' },
    { label: 'LLeida', value: '5' },
    { label: 'Galicia', value: '6' },
    { label: 'Malaga', value: '7' }
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
  }

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.formularioEmpleado.reset();
  }

  mostrarModalDeFiltros(): void {
    this.mostrarModalFiltros = true;
  }

  cerrarModalDeFiltros(): void {
    this.mostrarModalFiltros = false;
  }

  aplicarFiltro(): void {
    switch (this.filtroSeleccionado) {
      case 'departamento':
        switch (this.filtroDepartamento) {
          case 'Computing':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.department === 'Computing');
            break;
          case 'Billing':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.department === 'Billing');
            break;
          case 'Accounting':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.department === 'Accounting');
            break;
          case 'Finance':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.department === 'Finance');
            break;
          case 'Commercial':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.department === 'Commercial');
            break;
          case 'Sac':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.department === 'Sac');
            break;
          case 'Shopping':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.department === 'Shopping');
            break;
          case 'Logistics':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.department === 'Logistics');
            break;
          default:
            // Si no se selecciona ningún departamento, mostrar todos los empleados
            this.empleadosFiltrados = this.employees;
            break;
        }
        break;
      case 'sucursal':
        switch (this.filtroSucursal) {
          case 'Barcelona':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.branch_office === 'Barcelona');
            break;
          case 'Madrid':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.branch_office === 'Madrid');
            break;
          case 'Gerona':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.branch_office === 'Gerona');
            break;
          case 'Tarragona':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.branch_office === 'Tarragona');
            break;
          case 'LLeida':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.branch_office === 'LLeida');
            break;
          case 'Galicia':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.branch_office === 'Galicia');
            break;
          case 'Malaga':
            this.empleadosFiltrados = this.employees.filter(empleado => empleado.branch_office === 'Malaga');
            break;
          default:
            // Si no se selecciona ninguna sucursal, mostrar todos los empleados
            this.empleadosFiltrados = this.employees;
            break;
        }
        break;
        case 'ambos':
        if (this.filtroDepartamento && this.filtroSucursal) {
          this.empleadosFiltrados = this.employees.filter(empleado =>
            empleado.department === this.filtroDepartamento && empleado.branch_office === this.filtroSucursal);
        } else {
          // Si no se selecciona un departamento o sucursal, mostrar todos los empleados
          this.empleadosFiltrados = this.employees;
        }
        break;
      default:
        // Si no se selecciona ningún filtro, mostrar todos los empleados
        this.empleadosFiltrados = this.employees;
        break;
    }
  }
  
  

  obtenerEmpleados() {
    this.peticionesService.listEmployees().subscribe(
      (response: any[]) => {
        this.employees = response;
        this.empleadosFiltrados = response;
        this.aplicarFiltro();
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
          this.employees.push(response);
          console.log('Empleado añadido con éxito:', response);
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
