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
    this.userRole = this.authControlService.hasRole();
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
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam !== null) {
        const id: number = +idParam;
        try {
          this.ApiRequestService.getEmployee(id).subscribe(
            (employee: Employee) => {
              this.employeeDetails = [employee];
              console.log(this.employeeDetails[0].employee_materials)
              // Usando el operador de encadenamiento opcional para manejar valores undefined
              console.log(this.employeeDetails)
              this.cargaDatos = false;
              this.initForm();
            },
            (error: any) => {
              this.errorMessage = error.error.error;
            });
        } catch (error) {
          console.error('Error al obtener empleados:', error);
        }
      } else {
        this.errorMessage = 'ID del empleado no encontrado.';
      }
    });
  }


  volver() {
    this.router.navigate(['/employees_view']);
  }

  mostrarModal() {
    this.mostrarModalEditar = true;
  }

  cerrarModal() {
    this.mostrarModalEditar = false;
    this.getEmployeeDetails();
    this.formularioEmpleado.reset();
  }

  confirmDelete(id:number, name:string): void {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar a ${name}?`);
    if (confirmacion) {
      this.router.navigate(['/employees_view']);
      this.deleteEmployee(id);
    }
  }

  cargarOpciones() {
    forkJoin([
      this.authControlService.cargarRoles(),
      this.authControlService.cargarDepartamentos(),
      this.authControlService.cargarSucursales()
    ]).subscribe(
      ([roles, departamentos, sucursales]) => {
        this.roles = roles;
        this.departamentos = departamentos;
        this.sucursales = sucursales;
      }
    );
  }

  editarEmpleado(): void {
    this.successMessage='';
    this.errorMessage2='';
    if (this.formularioEmpleado.valid) {
      const empleadoEditado:Employee = this.formularioEmpleado.value;
      empleadoEditado.id = this.employeeDetails[0].id;
      this.ApiRequestService.editEmployee(this.employeeDetails[0].id, empleadoEditado).subscribe(
        (response: any) => {
          this.successMessage = response.message;
          this.cerrarModal();
          this.getEmployeeDetails();
        },
        (error: any) => {
          this.errorMessage2=error.error.error;
        }
      );
    } else {
      this.errorMessage2 = 'Formulario inválido. Por favor, complete todos los campos requeridos.';
    }
  }

  deleteEmployee(id: number): void {
    this.ApiRequestService.deleteEmployees(id)
    .subscribe(
      (response: any)=>{
        alert(response.message);
      },
      (error) =>{
        console.error('error', error)
      }
    );
  }

  desasignarMaterial(employeeId: any, materialId: any) {
    // Llama al servicio para desasignar el material
    console.log(materialId)
    this.ApiRequestService.desasignarMaterial(employeeId, materialId).subscribe(
      (response) => {
        // Actualiza la vista después de desasignar el material
        this.getEmployeeDetails();

        this.successMessage = response.message;
      },
      (error) => {
        console.error('Error al desasignar el material:', error);
      }
    );
  }


  private convertToCsv(data: any): string {
    if (!data || typeof data !== 'object') {
      console.error('Los datos de la tabla no son válidos.');
      return '';
    }

    // Extraemos los encabezados
    const headers = Object.keys(data);
    const csvRows = [headers.join(',')];

    // Convertimos cada objeto en una fila de CSV
    const extractValues = (obj: any) => {
      const values = headers.map(header => {
        if (typeof obj[header] === 'object' && obj[header] !== null) {
          return this.escapeCsvValue(obj[header].name); // Asumiendo que 'material' tiene una propiedad 'name'
        } else {
          return this.escapeCsvValue(obj[header]);
        }
      });
      return values.join(',');
    };

    csvRows.push(extractValues(data));

    return csvRows.join('\n');
  }


  downloadCsv() {
    if (!this.employeeDetails) {
      console.error('No hay datos de empleado disponibles');
      return;
    }
    const csvContent = this.convertToCsv([this.employeeDetails]);
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

  private escapeCsvValue(value: any): string {
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
