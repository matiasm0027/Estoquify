import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  formularioEmpleado: FormGroup;
 

  constructor(private fb: FormBuilder,private route: ActivatedRoute, private employeeService: ApiRequestService, private router: Router,) {
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
    this.getEmployeeIdFromRoute();
    this.getEmployeeDetails();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    if (this.sidebarVisible) {
      this.sidebarWidth = 250; // Ancho del sidebar cuando es visible
    } else {
      this.sidebarWidth = 0; // Ancho del sidebar cuando es invisible
    }
  }

  getEmployeeIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.employeeId = +params['id']; // Obtener el id del empleado de la ruta
      console.log(this.employeeId)
    });
  }

  getEmployeeDetails(): void {
    this.employeeService.getEmployeeDetails(this.employeeId)
      .subscribe(
        (employee: any) => {
          this.employeeDetails = employee;
          console.log(employee)
           // Verifica los detalles del empleado en la consola
        },
        (error: any) => {
          console.error('Error al obtener detalles del empleado:', error);
        }
      );

  }
  volver(){
    this.router.navigate(['/employees_view'])
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
        password: this.formularioEmpleado.value.password,
        departamento: this.formularioEmpleado.value.departamento,
        sucursal: this.formularioEmpleado.value.sucursal,
        rol: this.formularioEmpleado.value.rol,
        telefonoMovil: this.formularioEmpleado.value.telefonoMovil
      };
  
      this.employeeService.editEmployee(this.employeeId, empleadoEditado).subscribe(
        (response: any) => {
          console.log('Empleado editado correctamente', response);
          // Puedes cerrar el modal y actualizar la lista de empleados o hacer cualquier otra acción necesaria
          this.cerrarModal();
          this.getEmployeeDetails();
        },
        (error: any) => {
          console.error('Error al editar empleado:', error);
        }
      );
    } else {
      // Si el formulario no es válido, puedes mostrar un mensaje de error o realizar alguna otra acción
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

      this.deleteEmployee(this.employeeDetails.employee_id);
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

