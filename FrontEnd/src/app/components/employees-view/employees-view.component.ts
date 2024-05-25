import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { Employee } from '../../model/Employee';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { Router } from '@angular/router';

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

  errorMessage: string = '';
  errorMessage2: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private ApiRequestService: ApiRequestService,
    private authControlService: UsuariosControlService,
    private router: Router
  ) {
    this.formularioEmpleado = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+$')]],
      last_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),]],
      phone_number: ['', [Validators.required, Validators.pattern('(6|7)[ -]*([0-9][ -]*){8}')]],
      password: ['', Validators.required],
      department_id: ['', Validators.required],
      branch_office_id: ['', Validators.required],
      role_id: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Check the user role using the authentication control service
    this.userRole = this.authControlService.hasRole();
    
    // Load employees and filter them when the component initializes
    this.obtenerEmpleados();
    this.filtrarEmpleados();
}


filtrarEmpleados() {
  // Reset success message
  this.successMessage = "";
  
  // Trim search term
  const searchTermTrimmed = this.searchTerm.trim();
  
  // Filter employees based on search term
  if (!searchTermTrimmed) {
      // If search term is empty, show all employees
      this.empleadosFiltrados = this.employees;
  } else {
      // If search term is provided, filter employees based on name, last name, or email
      this.empleadosFiltrados = this.employees.filter((empleado) =>
          empleado.name.toLowerCase().includes(searchTermTrimmed.toLowerCase()) ||
          empleado.last_name.toLowerCase().includes(searchTermTrimmed.toLowerCase()) ||
          empleado.email.toLowerCase().includes(searchTermTrimmed.toLowerCase())
      );
      
      // Check if no employees are found
      if (this.empleadosFiltrados.length === 0) {
          // If no employees are found, display a message
          this.successMessage = "No hay ningún empleado con esos datos.";
      }
  }
}

opcionSeleccionada(opcion: string): boolean {
  // Check if the option is selected
  return this.opcionesFiltro.find(item => item.valor === opcion)?.seleccionado ?? false;
}

mostrarModal() {
  // Show the add modal
  this.mostrarModalAgregar = true;
}

cerrarModal() {
  // Close the add modal, reload employees, and reset employee form
  this.mostrarModalAgregar = false;
  this.obtenerEmpleados();
  this.formularioEmpleado.reset();
}

mostrarModalDeFiltros(): void {
  // Show the filter modal
  this.mostrarModalFiltros = true;
}

cerrarModalDeFiltros(): void {
  // Close the filter modal
  this.mostrarModalFiltros = false;
}

aplicarFiltro(): void {
  // Apply filters to employees
  this.empleadosFiltrados = this.employees.filter(empleado => {
      const filtroDepartamentoSeleccionado = this.opcionSeleccionada('departamento');
      const filtroSucursalSeleccionado = this.opcionSeleccionada('sucursal');

      if (filtroDepartamentoSeleccionado && filtroSucursalSeleccionado) {
          // If both department and branch office filters are selected, filter employees by both
          return empleado.department && empleado.branch_office &&
              empleado.department.id === Number(this.filtroDepartamento) &&
              empleado.branch_office.id === Number(this.filtroSucursal);
      } else if (filtroDepartamentoSeleccionado) {
          // If only department filter is selected, filter employees by department
          return empleado.department && empleado.department.id === Number(this.filtroDepartamento);
      } else if (filtroSucursalSeleccionado) {
          // If only branch office filter is selected, filter employees by branch office
          return empleado.branch_office && empleado.branch_office.id === Number(this.filtroSucursal);
      } else {
          // If no filters are selected, show all employees
          return true;
      }
  });
}

viewDetails(employee: number) {
  // Navigate to the employee details page
  this.router.navigate(['/employees_details', employee]);
}

obtenerEmpleados() {
  try {
    // Retrieve the list of employees from the API
    this.ApiRequestService.getEmployees().subscribe(employees => {
      // Assign the received employee data to the 'employees' array
      this.employees = employees;
      
      // Obtain unique roles, departments, and branch offices
      this.obtenerDepartamentosUnicos();
      this.obtenerSucursalesUnicas();
      this.obtenerRolesUnicos();
      
      // Apply any active filters to the employee data
      this.aplicarFiltro();
      
      // Set 'cargaDatos' to false to indicate data loading is complete
      this.cargaDatos = false;
    });
  } catch (error) {
    // Log any errors encountered during employee retrieval
    console.error('Error fetching employees:', error);
  }
}

obtenerRolesUnicos() {
  // Initialize a Map to store unique role IDs and names
  const rolesMap = new Map<number, string>();
  
  // Iterate through the 'employees' array to extract unique roles
  this.employees.forEach(employee => {
    // Check if the employee has a valid role with a name
    if (employee.role && employee.role.name) {
      // Add the role ID and name to the 'rolesMap'
      rolesMap.set(employee.role.id, employee.role.name);
    }
  });
  
  // Convert the 'rolesMap' entries into an array of objects with 'id' and 'name' properties
  this.roles = Array.from(rolesMap, ([id, name]) => ({ id, name }));
}


obtenerDepartamentosUnicos() {
  // Initialize a Map to store unique department IDs and names
  const departamentosMap = new Map<number, string>();
  
  // Iterate through the 'employees' array to extract unique departments
  this.employees.forEach(employee => {
    // Check if the employee has a valid department with a name
    if (employee.department && employee.department.name) {
      // Add the department ID and name to the 'departamentosMap'
      departamentosMap.set(employee.department.id, employee.department.name);
    }
  });
  
  // Convert the 'departamentosMap' entries into an array of objects with 'id' and 'name' properties
  this.departamentos = Array.from(departamentosMap, ([id, name]) => ({ id, name }));
}

obtenerSucursalesUnicas() {
  // Initialize a Map to store unique branch office IDs and names
  const sucursalesMap = new Map<number, string>();
  
  // Iterate through the 'employees' array to extract unique branch offices
  this.employees.forEach(employee => {
    // Check if the employee has a valid branch office with a name
    if (employee.branch_office && employee.branch_office.name) {
      // Add the branch office ID and name to the 'sucursalesMap'
      sucursalesMap.set(employee.branch_office.id, employee.branch_office.name);
    }
  });
  
  // Convert the 'sucursalesMap' entries into an array of objects with 'id' and 'name' properties
  this.sucursales = Array.from(sucursalesMap, ([id, name]) => ({ id, name }));
}


agregarEmpleado(): void {
  // Clear any previous error and success messages
  this.errorMessage2 = "";
  this.successMessage = "";

  // Check if the form is valid
  if (this.formularioEmpleado.valid) {
    // Extract the values from the form to create a new Employee object
    const nuevoEmpleado: Employee = this.formularioEmpleado.value;

    try {
      // Call the API service to add the new employee
      this.ApiRequestService.addEmployee(nuevoEmpleado).subscribe(
        // Handle successful response from the API
        (response: any) => {
          // Set success message from the API response
          this.successMessage = response.message;
          // Close the modal after successfully adding the employee
          this.cerrarModal();
        },
        // Handle errors from the API call
        (error: any) => {
          // Set error message from the API response
          this.errorMessage2 = error.error.error;
          // No additional action needed in case of error
        }
      );
    } catch (error) {
      // Handle any unexpected errors
      this.errorMessage2 = 'Error adding employee: ' + error;
      // No additional action needed in case of error
    }
  } else {
    // Set error message if the form is invalid
    this.errorMessage2 = 'Invalid form. Please fill in all required fields.';
  }
}



private convertToCsv(data: any[]): string {
  // Check if the input data is valid
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Table data is invalid or empty.');
    return '';
  }

  const csvRows: string[] = [];
  const headers: string[] = [];

  // Extract headers from the first row
  for (const key in data[0]) {
    headers.push(key);
  }
  csvRows.push(headers.join(','));

  // Iterate over each object in the array and generate a CSV row
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
  // Escape CSV values, especially handling quotes
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

downloadCsv(): void {
  // Check if there are filtered employees to download
  if (!this.empleadosFiltrados || this.empleadosFiltrados.length === 0) {
    console.error('No employee data available');
    return;
  }

  // Convert filtered employee data to CSV format
  const csvContent = this.convertToCsv(this.empleadosFiltrados);

  // Create a blob from the CSV content and generate a download link
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'employees.csv';
  document.body.appendChild(a);
  a.click();

  // Clean up by revoking the URL and removing the anchor element
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

downloadEmployeeCsv(): void {
  // Check if there are employee data available to download
  if (!this.employees) {
    console.error('No employee data available');
    return;
  }
}

}
