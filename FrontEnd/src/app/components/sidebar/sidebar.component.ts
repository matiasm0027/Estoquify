import { Component, OnInit } from '@angular/core';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { Employee } from 'src/app/model/Employee';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  loggedInUser: Employee | null = null; // Inicializar con un valor nulo
  userRole!: any;
  showChatModal: boolean = false;
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedEmployee: Employee | undefined;
  placeholder: string = "Seleccionar Administrador";
   
  constructor(private authControlService: UsuariosControlService,  private apiRequestService: ApiRequestService) {}

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(() => {
      this.loggedInUser = this.authControlService.getStoredLoggedInUser();
    });
    
  }

  logout(): void {
    this.authControlService.logout();
    window.location.reload();
  }
  
  toggleSidebar(): void {
    const sidebar = document.getElementById('logo-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('hidden'); 
    }
  }

  toggleChatModal() {
    this.showChatModal = !this.showChatModal;
  }

  obtenerEmpleados() {
    this.apiRequestService.getEmployees().subscribe(
      (data: Employee[]) => {
        

        // Filtrar empleados por nombre de sucursal
        this.employees = data.filter(employee => employee.role_id === 1);

        // Filtrar filteredEmployees por nombre de sucursal
        this.filteredEmployees = this.employees;

        // Transformar fullname
        this.filteredEmployees.forEach(employee => {
          employee.fullname = employee.name + ' ' + employee.last_name;
        });

        console.log(this.employees);
       
      },
      error => {
        console.error('Error al obtener empleados:', error);
      }
    );
  }

  buscarEmpleado(event: { term: string; items: any[]; }) {
    this.selectedEmployee = undefined;
    const searchTerm = event.term.toLowerCase();

    // Si hay un término de búsqueda, filtrar la lista de empleados, de lo contrario, mostrar todos los empleados
    if (searchTerm.trim() !== '') {
      this.filteredEmployees = this.employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.last_name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredEmployees = this.employees;
    }
}

  seleccionarEmpleado(employee: Employee) {
    this.selectedEmployee = employee;
    this.placeholder = '';
    this.filteredEmployees = this.employees;
  }

  limpiarSeleccion() {
    this.selectedEmployee = undefined;
}

crearConexion() {
  // Crear la fila en el chat con los datos necesarios
  const nuevaConexion = {
    sender: this.loggedInUser?.id,
    receiver: this.selectedEmployee?.id,
    message: '' // Mensaje vacío por defecto
  };

  // Enviar la solicitud para crear la nueva conexión
  this.apiRequestService.crearConexion(nuevaConexion).subscribe(
    (response) => {
      // Manejar la respuesta del servidor si es necesario
      console.log('Conexión creada exitosamente:', response);
      
      // Limpiar la selección de empleado
      this.selectedEmployee = undefined;
    },
    (error) => {
      console.error('Error al crear la conexión:', error);
    }
  );

  // Limpiar la selección de empleado
  this.selectedEmployee = undefined;
}
}
