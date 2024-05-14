import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { Employee } from '../../model/Employee';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { RequestManagerService } from 'src/app/services/requestManager/request-manager.service';

@Component({
  selector: 'app-employees-view',
  templateUrl: './employees-view.component.html',
  styleUrls: ['./employees-view.component.css']
})
export class EmployeesViewComponent implements OnInit, OnDestroy {
  page: number = 1;
  employees: Employee[] = [];
  empleadosFiltrados: any[] = [];
  mostrarModalAgregar: boolean = false;
  filtroSeleccionado: string = '';
  mostrarModalFiltros: boolean = false;
  formularioEmpleado: FormGroup;
  filtroDepartamento: string = '';
  filtroSucursal: string = '';
  departamentos: any[] = [];
  sucursales: any[] = [];
  employeeId!: number;
  employeeRole!: string;
  searchTerm: string = '';
  opcionesFiltro: { valor: string, etiqueta: string, seleccionado: boolean }[] = [
    { valor: 'departamento', etiqueta: 'Departamento', seleccionado: false },
    { valor: 'sucursal', etiqueta: 'Sucursal', seleccionado: false },
  ];
  errorMessage!: string;
  successMessage!: string;
  cargaDatos: boolean = true;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private fb: FormBuilder, 
    private peticionesService: ApiRequestService,
    private requestManagerService: RequestManagerService // Inyección del servicio RequestManagerService
  ) {
    this.formularioEmpleado = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+$')]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),]],
      password: ['', Validators.required],
      departamento: ['', Validators.required],
      sucursal: ['', Validators.required],
      rol: ['', Validators.required],
      telefonoMovil: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }

  ngOnInit(): void {
    this.obtenerEmpleados();
    this.obtenerDepartamento();
    this.obtenerSucursales();
    this.getLoggedUser();
    this.filtrarEmpleados();
  }

  ngOnDestroy(): void {
    // Limpieza de las suscripciones al destruir el componente
    this.requestManagerService.clearSubscriptions();
  }

  filtrarEmpleados() {
    if (!this.searchTerm.trim()) {
      this.empleadosFiltrados = this.employees;
    } else {
      this.empleadosFiltrados = this.employees.filter((empleado) =>
        empleado.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        empleado.last_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  opcionSeleccionada(opcion: string): boolean {
    return this.opcionesFiltro.find(item => item.valor === opcion)?.seleccionado ?? false;
  }

  obtenerDepartamento() {
    try {
      this.requestManagerService.addSubscription( // Agregar suscripción al servicio
        this.peticionesService.listDepartments()
          .subscribe(
            (response: any[]) => {
              this.departamentos = response;
              this.cargaDatos = false;
            },
            error => {
              this.errorMessage = error.error.error;

            }
          )
      );
    } catch (error) {
      console.error('Error al obtener departamento:', error);
    }
  }

  obtenerSucursales() {
    try {
      this.requestManagerService.addSubscription( // Agregar suscripción al servicio
        this.peticionesService.listBranchOffices()
          .subscribe(
            (response: any[]) => {
              this.sucursales = response;
              this.cargaDatos = false;
            },
            error => {
              this.errorMessage = error.error.error;
              console.error(error.error);
            }
          )
      );
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
    }
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
        return true;
      }
    });
  }

  obtenerEmpleados() {
    try {
      this.requestManagerService.addSubscription( // Agregar suscripción al servicio
        this.peticionesService.listEmployees()
          .subscribe(
            (data: Employee[]) => {
              this.employees = data;
              this.aplicarFiltro();
              this.cargaDatos = false;
            },
            error => {
              this.errorMessage = error.error.error;

            }
          )
      );
    } catch (error) {
      console.error('Error al obtener empleados:', error);
    }
  }

  agregarEmpleado(): void {
    if (this.formularioEmpleado.valid) {
      const nuevoEmpleado = this.formularioEmpleado.value;
      try {
        this.peticionesService.addEmployee(nuevoEmpleado).subscribe(
          (response: any) => {
            this.successMessage = response.message;
            this.cerrarModal();
          },
          (error: any) => {
            this.errorMessage = error.error.error;
          }
        );
      } catch (error) {
        console.error('Error al agregar empleado:', error);
      }
    } else {
      console.error('Formulario inválido. Por favor, complete todos los campos requeridos.');
    }
  }

  getLoggedUser(): void {
    try {
      this.requestManagerService.addSubscription( // Agregar suscripción al servicio
        this.peticionesService.me()
          .subscribe(
            (response: any) => {
              this.employeeId = response.id;
              const roleId = response.role_id;
              if (roleId === 1) {
                this.employeeRole = 'admin';
              } else if (roleId === 2) {
                this.employeeRole = 'manager';
              } else if (roleId === 3) {
                this.employeeRole = 'usuario';
              }
              this.cargaDatos = false;
            },
            (error: any) => {
              this.errorMessage = error.error.error;

            }
          )
      );
    } catch (error) {
      console.error('Error al obtener usuario logueado:', error);
    }
  }

  private convertToCsv(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Los datos de la tabla no son válidos o están vacíos.');
      return '';
    }

    const csvRows: string[] = [];
    const headers: string[] = [];

    // Extraer encabezados de la primera fila
    for (const key in data[0]) {
      headers.push(key);
    }
    csvRows.push(headers.join(','));

    // Iterar sobre cada objeto en la matriz y generar una fila de CSV
    data.forEach(obj => {
      const values: string[] = [];
      headers.forEach(header => {
        values.push(this.escapeCsvValue(obj[header]));
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  private escapeCsvValue(value: any): string {
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  downloadCsv(): void {
    if (!this.empleadosFiltrados || this.empleadosFiltrados.length === 0) {
      console.error('No hay datos de empleado disponibles');
      return;
    }

    const csvContent = this.convertToCsv(this.empleadosFiltrados);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  downloadEmployeeCsv(): void {
    if (!this.employees) {
      console.error('No hay datos de empleado disponibles');
      return;
    }
  }

}
