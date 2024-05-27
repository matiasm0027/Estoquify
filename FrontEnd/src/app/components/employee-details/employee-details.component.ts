import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Employee } from 'src/app/model/Employee';
import { Material } from 'src/app/model/Material';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})

export class EmployeeDetailsComponent implements OnInit {
  employeeDetails!: Employee[];
  departamentos: { id: number; name: string; }[] = [];
  sucursales: { id: number; name: string; }[] = [];
  roles: { id: number; name: string; }[] = [];
  mostrarModalEditar: boolean = false;
  formularioEmpleado!: FormGroup;
  successMessage!: string;
  cargaDatos: boolean = false;
  errorMessage!: string;
  errorMessage2!: string;
  userRole!: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ApiRequestService: ApiRequestService,
    public authControlService: UsuariosControlService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Check user role
    this.userRole = this.authControlService.hasRole();
  
    // Load options and get employee details when the component initializes
    this.cargarOpciones();
    this.getEmployeeDetails();
  }
  
  initForm() {
    this.formularioEmpleado = this.fb.group({
      name: [this.employeeDetails[0].name, [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z ]*$')]],
      last_name: [this.employeeDetails[0].last_name, [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z ]*$')]],
      email: [this.employeeDetails[0].email, [Validators.required, Validators.email]],
      phone_number: [this.employeeDetails[0].phone_number, [Validators.required, Validators.pattern('^[0-9]*$')]],
      department_id: [this.employeeDetails[0].department?.id, Validators.required],
      branch_office_id: [this.employeeDetails[0].branch_office?.id, Validators.required],
      role_id: [this.employeeDetails[0].role?.id, Validators.required],
    });
  }

  getEmployeeDetails(): void {
    // Subscribe to route parameter changes
    this.route.paramMap.subscribe(params => {
      // Get the 'id' parameter from the route
      const idParam = params.get('id');
  
      // Check if 'id' parameter exists
      if (idParam !== null) {
        // Parse 'id' parameter to number
        const id: number = +idParam;
        try {
          // Call the API service to get employee details by ID
          this.ApiRequestService.getEmployee(id).subscribe(
            // On successful response, assign the employee details to 'employeeDetails' array
            (employee: Employee) => {
              this.employeeDetails = [employee];
  
              // Set cargaDatos to false to indicate data loading is complete
              this.cargaDatos = false;
  
              // Initialize form
              this.initForm();
            },
            // On error, assign error message
            (error: any) => {
              this.errorMessage = error.error.error;
            });
        } catch (error) {
          console.error('Error al obtener empleados:', error);
        }
      } else {
        // If 'id' parameter is not found, assign error message
        this.errorMessage = 'ID del empleado no encontrado.';
      }
    });
  }
  


 // Navigate back to the employees view page
volver() {
  this.router.navigate(['/employees_view']);
}

// Display the edit modal
mostrarModal() {
  this.mostrarModalEditar = true;
}

// Close the edit modal
cerrarModal() {
  this.mostrarModalEditar = false;
  
  // Reload employee details and reset the form
  this.getEmployeeDetails();
  this.formularioEmpleado.reset();
}

// Confirm the deletion of an employee
confirmDelete(id:number, name:string): void {
  // Display confirmation dialog with employee name
  const confirmacion = confirm(`Are you sure you want to delete ${name}?`);
  
  // If user confirms deletion, navigate back to employees view and delete employee
  if (confirmacion) {
    this.router.navigate(['/employees_view']);
    this.deleteEmployee(id);
  }
}


 // Load options for roles, departments, and branches simultaneously
cargarOpciones() {
  forkJoin([
    this.authControlService.cargarRoles(),
    this.authControlService.cargarDepartamentos(),
    this.authControlService.cargarSucursales()
  ]).subscribe(
    ([roles, departamentos, sucursales]) => {
      // Assign loaded roles, departments, and branches to respective variables
      this.roles = roles;
      this.departamentos = departamentos;
      this.sucursales = sucursales;
    }
  );
}

// Edit employee details
editarEmpleado(): void {
  this.successMessage='';
  this.errorMessage2='';
  
  // Check if the employee edit form is valid
  if (this.formularioEmpleado.valid) {
    // Get edited employee details from the form
    const empleadoEditado: Employee = this.formularioEmpleado.value;
    // Assign the ID of the employee being edited
    empleadoEditado.id = this.employeeDetails[0].id;
    
    // Call the API service to edit the employee
    this.ApiRequestService.editEmployee(this.employeeDetails[0].id, empleadoEditado).subscribe(
      (response: any) => {
        // Display success message, close modal, and reload employee details after successful edit
        this.successMessage = response.message;
        this.cerrarModal();
        this.getEmployeeDetails();
      },
      (error: any) => {
        // Display error message if editing employee fails
        this.errorMessage2 = error.error.error;
      }
    );
  } else {
    // Display error message if the employee edit form is invalid
    this.errorMessage2 = 'Invalid form. Please complete all required fields.';
  }
}

 // Delete employee by ID
deleteEmployee(id: number): void {
  // Call API service to delete employee
  this.ApiRequestService.deleteEmployees(id)
  .subscribe(
    (response: any)=>{
      // Show alert with delete response message
      alert(response.message);
    },
    (error) =>{
      // Log error if deletion fails
      console.error('Error', error)
    }
  );
}

// Unassign material from employee
desasignarMaterial(employeeId: any, materialId: any) {
  // Call service to unassign material
  this.ApiRequestService.desasignarMaterial(employeeId, materialId).subscribe(
    (response) => {
      // Update view after unassigning material
      this.getEmployeeDetails();
      // Show success message
      this.successMessage = response.message;
    },
    (error) => {
      // Log error if unassigning material fails
      console.error('Error unassigning material:', error);
    }
  );
}



 // Convert data to CSV format
private convertToCsv(data: any[]): string {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error('Table data is not valid.');
    return '';
  }

  // Extract headers from the first object, excluding 'employee_materials'
  const headers = Object.keys(data[0]).filter(header => header !== 'employee_materials');
  // Add a 'materials' header for the materials assigned to each employee
  headers.push('materials');
  
  const csvRows = [headers.join(',')];

  const extractValues = (obj: any) => {
    const values = headers.map(header => {
      if (header === 'materials') {
        // Concatenate material names assigned to the employee
        return obj.employee_materials ? 
          obj.employee_materials.map((em: any) => em.material.name).join('; ') : '';
      } else if (typeof obj[header] === 'object' && obj[header] !== null) {
        return this.escapeCsvValue(obj[header].name || obj[header].toString());
      } else {
        return this.escapeCsvValue(obj[header]);
      }
    });
    return values.join(',');
  };

  data.forEach(item => {
    csvRows.push(extractValues(item));
  });

  return csvRows.join('\n');
}

// Download CSV file
downloadCsv() {
  if (!this.employeeDetails || this.employeeDetails.length === 0) {
    console.error('No employee data available');
    return;
  }
  
  const csvContent = this.convertToCsv(this.employeeDetails);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const fileName = `${this.employeeDetails[0].name}_${this.employeeDetails[0].last_name}.csv`;
  a.download = fileName;
  document.body.appendChild(a);
  
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Escape special characters in CSV value
private escapeCsvValue(value: any): string {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value !== undefined ? value : '';
}

}
