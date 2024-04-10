import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-employee-view',
  templateUrl: './employee-view.component.html',
  styleUrls: ['./employee-view.component.css']
})

export class EmployeeViewComponent implements OnInit {
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
    // Implementa la lógica para aplicar el filtro seleccionado
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
