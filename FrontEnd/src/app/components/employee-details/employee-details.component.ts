import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { RequestManagerService } from 'src/app/services/requestManager/request-manager.service';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})
export class EmployeeDetailsComponent implements OnInit , OnDestroy {
  employeeId!: number;
  employeeDetails: any = {};
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
  cargaDatos: boolean = true;
  errorMessage!: string;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private employeeService: ApiRequestService,
    private router: Router,
    private requestManager: RequestManagerService,
  ) {}


  ngOnInit(): void {
    this.getEmployeeIdFromRoute();
    this.obtenerDepartamento();
    this.obtenerSucursales();
    this.getEmployeeDetails();
    this.getLoggedUser();
  }

  ngOnDestroy(): void {
    this.requestManager.clearSubscriptions();
  }

  initForm() {
    this.formularioEmpleado = this.fb.group({
      nombre: [this.employeeDetails.name, Validators.required],
      apellido: [this.employeeDetails.last_name, Validators.required],
      email: [this.employeeDetails.email, [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),]],
      departamento: [this.employeeDetails.department, Validators.required],
      sucursal: [this.employeeDetails.branch_office, Validators.required],
      rol: [this.employeeDetails.role, Validators.required],
      telefonoMovil: [this.employeeDetails.phone_number, Validators.required]
    });
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
          this.cargaDatos = false;
          this.initForm(); // Initialize form after employee details are fetched
        },
        (error: any) => {
          this.errorMessage = error.error.error;
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
            this.successMessage = response.message;
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
        this.cargaDatos = false;

      },
      error => {
        this.errorMessage = error.error.error;

      }
    );
  }


  obtenerSucursales() {
    this.employeeService.listBranchOffices().subscribe(
      (response: any[]) => {
        this.sucursales = response;
        this.cargaDatos = false;

      },
      error => {
        this.errorMessage = error.error.error;
        console.error(error.error);
        console.error(error.error.eror);


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
    this.employeeService.getLoggedInUser().subscribe(
      (response: any) => {

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
        this.errorMessage = error.error.error;

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
    const fileName = `${this.employeeDetails.name}_${this.employeeDetails.last_name}.csv`;
    
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
