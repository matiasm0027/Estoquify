import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})
export class EmployeeDetailsComponent implements OnInit {
  employeeId!: number;
  employeeDetails: any = {};
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;
  departamentos: any[] = [];
  sucursales: any[] = [];
  mostrarModalEditar: boolean = false;
  formularioEmpleado!: FormGroup;
  roles: any[] = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'User' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private employeeService: ApiRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEmployeeIdFromRoute();
    this.obtenerDepartamento();
    this.obtenerSucursales();
    this.getEmployeeDetails();
  }

  initForm() {
    this.formularioEmpleado = this.fb.group({
      nombre: [this.employeeDetails.name, Validators.required],
      apellido: [this.employeeDetails.last_name, Validators.required],
      email: [this.employeeDetails.email, [Validators.required, Validators.email]],
      departamento: [this.employeeDetails.department, Validators.required],
      sucursal: [this.employeeDetails.branch_office, Validators.required],
      rol: [this.employeeDetails.role, Validators.required],
      telefonoMovil: [this.employeeDetails.phone_number]
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarWidth = this.sidebarVisible ? 250 : 0;
  }

  getEmployeeIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.employeeId = +params['id'];
    });
  }

  getEmployeeDetails(): void {
    this.employeeService.getEmployeeDetails(this.employeeId)
      .subscribe(
        (employee: any) => {
          this.employeeDetails = employee;
          this.initForm(); // Initialize form after employee details are fetched
        },
        (error: any) => {
          console.error('Error al obtener detalles del empleado:', error);
        }
      );
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

  editarEmpleado(): void {
   
      if (this.formularioEmpleado.valid) {
      const empleadoEditado = {
        id: this.employeeId,
        nombre: this.formularioEmpleado.value.nombre,
        apellido: this.formularioEmpleado.value.apellido,
        email: this.formularioEmpleado.value.email,
        departamento: this.formularioEmpleado.value.departamento,
        sucursal: this.formularioEmpleado.value.sucursal,
        rol: this.formularioEmpleado.value.rol,
        telefonoMovil: this.formularioEmpleado.value.telefonoMovil
      };

      this.employeeService.editEmployee(this.employeeId, empleadoEditado).subscribe(
        (response: any) => {
          console.log('Empleado editado correctamente', response);
          this.cerrarModal();
          this.getEmployeeDetails();
        },
        (error: any) => {
          console.error('Error al editar empleado:', error);
        }
      );
    } else {
      console.error('Formulario inválido');
    }
  }

  obtenerDepartamento() {
    this.employeeService.listDepartments().subscribe(
      (response: any[]) => {
        this.departamentos = response;
      },
      error => {
        console.error('Error al obtener department:', error);
      }
    );
  }

  obtenerSucursales() {
    this.employeeService.listBranchOffices().subscribe(
      (response: any[]) => {
        this.sucursales = response;
      },
      error => {
        console.error('Error al obtener sucursales:', error);
      }
    );
  }

  confirmDelete(employee: any): void {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar a ${employee.name}?`);
    if (confirmacion) {
      this.deleteEmployee(employee.employee_id);
    }
  }

  deleteEmployee(id: number): void {
    this.employeeService.deleteEmployees(id).subscribe(
      (response) => {
        console.log('Empleado eliminado correctamente', response);
        this.router.navigate(['/employees_view']); 
      },
      error => {
        console.error(`Error al eliminar empleado con ID ${id}:`, error);
      }
    );
  }
}
