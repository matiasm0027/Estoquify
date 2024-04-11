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
  mostrarModalAgregar: boolean = false;
  filtroSeleccionado: string = 'departamento';
  mostrarModalFiltros: boolean = false;
  formularioEmpleado: FormGroup;
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
    // Verificar el filtro seleccionado
    if (this.filtroSeleccionado === 'departamento') {
        // Filtrar empleados por departamento
        this.peticionesService.listEmployeesByDepartment(this.formularioEmpleado.value.departamento).subscribe(
            (response: any[]) => {
                this.employees = response;
            },
            error => {
                console.error('Error al filtrar empleados por departamento:', error);
            }
        );
    } else if (this.filtroSeleccionado === 'sucursal') {
        // Filtrar empleados por sucursal
        this.peticionesService.listEmployeesByBranchOffice(this.formularioEmpleado.value.sucursal).subscribe(
            (response: any[]) => {
                this.employees = response;
            },
            error => {
                console.error('Error al filtrar empleados por sucursal:', error);
            }
        );
    }
}

  obtenerEmpleados() {
    this.peticionesService.listEmployees().subscribe(
      (response: any[]) => {
        this.employees = response;
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
