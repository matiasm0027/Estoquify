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
  employeeRole!:string;
  roles: any[] = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'User' }
  ];
  successMessage!: string;

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
    this.getLoggedUser();
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
    this.getEmployeeIdFromRoute();
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
        // Obtener el ID del departamento
        let departamentoId = this.formularioEmpleado.value.departamento;
        if (!isNaN(parseInt(departamentoId))) {
            departamentoId = parseInt(departamentoId);
        } else {
            const departamentoEncontrado = this.departamentos.find(dept => dept.name === departamentoId);
            if (departamentoEncontrado) {
                departamentoId = departamentoEncontrado.id;
            } 
        }

        // Obtener el ID de la sucursal
        let sucursalId = this.formularioEmpleado.value.sucursal;
        if (!isNaN(parseInt(sucursalId))) {
            sucursalId = parseInt(sucursalId);
        } else {
            const sucursalEncontrada = this.sucursales.find(suc => suc.name === sucursalId);
            if (sucursalEncontrada) {
                sucursalId = sucursalEncontrada.id;
            } 
        }

        // Obtener el ID del rol
        let rolId = this.formularioEmpleado.value.rol;
        if (!isNaN(parseInt(rolId))) {
            rolId = parseInt(rolId);
        } else {
            const rolEncontrado = this.roles.find(rol => rol.name === rolId);
            if (rolEncontrado) {
                rolId = rolEncontrado.id;
            } 
        }

        const empleadoEditado = {
            id: this.employeeId,
            nombre: this.formularioEmpleado.value.nombre,
            apellido: this.formularioEmpleado.value.apellido,
            email: this.formularioEmpleado.value.email,
            departamento: departamentoId,
            sucursal: sucursalId,
            rol: rolId,
            telefonoMovil: this.formularioEmpleado.value.telefonoMovil
        };

     

        this.employeeService.editEmployee(this.employeeId, empleadoEditado).subscribe(
          (response: any) => {
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
      this.router.navigate(['/employees_view']); 
      this.deleteEmployee(employee.employee_id);
      alert(`El empleado ${employee.name} ha sido eliminado.`);
    }
  }


  deleteEmployee(id: number): void {

    // Llamar al servicio para eliminar al empleado
    this.employeeService.deleteEmployees(id).subscribe(
      (response) => {
        // Navegar a la vista de empleados después de eliminar con éxito
      },
      error => {
        console.error(`Error al eliminar empleado con ID ${id}:`, error);
        // Manejar errores en caso de que la eliminación falle
      }
    );
  }


  desasignarMaterial(employeeId: number, materialId: number){
    // Lógica para desasignar el material del empleado actualmente asignado

    // Llama al servicio para desasignar el material
    this.employeeService.desasignarMaterial(materialId, employeeId).subscribe(
      (response) => {
        // Actualiza la vista después de desasignar el material
        this.getEmployeeDetails();
        
        this.successMessage = response.message;
        this.clearMessagesAfterDelay();
      },
      (error) => {
        console.error('Error al desasignar el material:', error);
      }
    );
  }


  clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      //this.errorMessage = '';
    }, 2000); 
  }


  getLoggedUser(): void {
    this.employeeService.me().subscribe(
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
}
