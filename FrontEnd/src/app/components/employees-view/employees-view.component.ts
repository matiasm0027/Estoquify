import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { Employee } from '../../model/Employee';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-employees-view',
  templateUrl: './employees-view.component.html',
  styleUrls: ['./employees-view.component.css']
})
export class EmployeesViewComponent implements OnInit {
  page: number = 1;

  employees!: Employee[];
  roles: { id: number; name: string; }[] = []; 
  departamentos: { id: number; name: string; }[] = []; 
  sucursales: { id: number; name: string; }[] = [];
  empleadosFiltrados: any[] = [];

  loggedInUser: Employee | null = null; // Inicializar con un valor nulo
  userRole!: any;

  filtroSeleccionado: string = '';
  filtroDepartamento: string = '';
  filtroSucursal: string = '';
  searchTerm: string = '';

  mostrarModalFiltros: boolean = false;
  mostrarModalAgregar: boolean = false;

  opcionesFiltro: { valor: string, etiqueta: string, seleccionado: boolean }[] = [
    { valor: 'departamento', etiqueta: 'Departamento', seleccionado: false },
    { valor: 'sucursal', etiqueta: 'Sucursal', seleccionado: false },
  ];

  formularioEmpleado: FormGroup;
  
  employeeId!: number;
  cargaDatos: boolean = true;
  
  errorMessage!: string;
  successMessage!: string;
  
  constructor(
    private fb: FormBuilder,
    private ApiRequestService: ApiRequestService,
    private authControlService: UsuariosControlService
  ) {
    this.formularioEmpleado = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+$')]],
      last_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),]],
      phone_number: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      password: ['', Validators.required],
      department_id: ['', Validators.required],
      branch_office_id: ['', Validators.required],
      role_id: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.obtenerEmpleados();
    this.filtrarEmpleados();
  }

  filtrarEmpleados() {
    const searchTermTrimmed = this.searchTerm.trim();
    if (!searchTermTrimmed) {
      this.empleadosFiltrados = this.employees;
    } else {
      this.empleadosFiltrados = this.employees.filter((empleado) =>
        empleado.name.toLowerCase().includes(searchTermTrimmed.toLowerCase()) ||
        empleado.last_name.toLowerCase().includes(searchTermTrimmed.toLowerCase()) ||
        empleado.email.toLowerCase().includes(searchTermTrimmed.toLowerCase())
      );
    }
  }   

  opcionSeleccionada(opcion: string): boolean {
    return this.opcionesFiltro.find(item => item.valor === opcion)?.seleccionado ?? false;
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
        return empleado.department && empleado.branch_office &&
               empleado.department.id === Number(this.filtroDepartamento) &&
               empleado.branch_office.id === Number(this.filtroSucursal);
      } else if (filtroDepartamentoSeleccionado) {
        return empleado.department && empleado.department.id === Number(this.filtroDepartamento);
      } else if (filtroSucursalSeleccionado) {
        return empleado.branch_office && empleado.branch_office.id === Number(this.filtroSucursal);
      } else {
        return true;
      }
    });
  }
  
  obtenerEmpleados() {
    try {
      this.ApiRequestService.getEmployees().subscribe(employees => {
        this.employees = employees;
        this.obtenerDepartamentosUnicos();
        this.obtenerSucursalesUnicas();
        this.obtenerRolesUnicos();
        this.aplicarFiltro(); // Llamar al método de filtrado después de obtener los empleados
        this.cargaDatos = false;
      });
    } catch (error) {
      console.error('Error al obtener empleados:', error);
    }
  }

  obtenerRolesUnicos() {
    const rolesMap = new Map<number, string>();
    this.employees.forEach(empleado => {
      if (empleado.role && empleado.role.name) {
        rolesMap.set(empleado.role.id, empleado.role.name);
      }
    });
    this.roles = Array.from(rolesMap, ([id, name]) => ({ id, name }));
  }
  
  obtenerDepartamentosUnicos() {
    const departamentosMap = new Map<number, string>();
    this.employees.forEach(empleado => {
      if (empleado.department && empleado.department.name) {
        departamentosMap.set(empleado.department.id, empleado.department.name);
      }
    });
    this.departamentos = Array.from(departamentosMap, ([id, name]) => ({ id, name }));
  }
  
  obtenerSucursalesUnicas() {
    const sucursalesMap = new Map<number, string>();
    this.employees.forEach(empleado => {
      if (empleado.branch_office && empleado.branch_office.name) {
        sucursalesMap.set(empleado.branch_office.id, empleado.branch_office.name);
      }
    });
    this.sucursales = Array.from(sucursalesMap, ([id, name]) => ({ id, name }));
  }
  
  agregarEmpleado(): void {
    if (this.formularioEmpleado.valid) {
      const nuevoEmpleado: Employee = this.formularioEmpleado.value;
      console.log(nuevoEmpleado)
      try {
        this.ApiRequestService.addEmployee(nuevoEmpleado).subscribe(
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
