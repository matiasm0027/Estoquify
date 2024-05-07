import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { Employee } from '../../model/Employee';

@Component({
  selector: 'app-employees-view',
  templateUrl: './employees-view.component.html',
  styleUrls: ['./employees-view.component.css']
})

export class EmployeesViewComponent implements OnInit {
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
  employeeId!:number;
  employeeRole!:string;

  opcionesFiltro: { valor: string, etiqueta: string, seleccionado: boolean }[] = [
    { valor: 'departamento', etiqueta: 'Departamento', seleccionado: false },
    { valor: 'sucursal', etiqueta: 'Sucursal', seleccionado: false },
];


  

  constructor(private fb: FormBuilder, private peticionesService: ApiRequestService) {
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
  }

  opcionSeleccionada(opcion: string): boolean {
    return this.opcionesFiltro.find(item => item.valor === opcion)?.seleccionado ?? false;
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
      (data: Employee[]) => {
        this.employees = data;
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

  getLoggedUser(): void {
    this.peticionesService.me().subscribe(
      (response: any) => {
        this.employeeId = response.id;
        const roleId = response.role_id;
       
        
        if (roleId === 1) {
          this.employeeRole = 'admin';
        } else if (roleId === 2){
          this.employeeRole = 'manager';
        } else if (roleId===3){
          this.employeeRole= 'usuario'
        }
      },
      error => {
        console.error('Error when obtaining data from the logged in user:', error);
      }
    );
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
  

  downloadCsv() {
    if (!this.employees) {
      console.error('No hay datos de empleado disponibles');
      return;
    }
    const csvContent = this.convertToCsv(this.employees);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_details.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  
}
