import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from 'src/app/model/Employee';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrl: './chat-view.component.css'
})
export class ChatViewComponent implements OnInit {
  loggedInUser: Employee | null = null; // Inicializar con un valor nulo
  userRole: any;
  showChatModal: boolean = false;
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedEmployee: Employee | undefined;
  placeholder: string = "Seleccionar Empleado";
  formularioEmpleado: FormGroup;
  activeChats: any[] = [];
  ngSelectSeleccionado: boolean = false;
  chatActivo: any;
  mostrarMensajes: boolean = false;


  constructor(private authControlService: UsuariosControlService, private apiRequestService: ApiRequestService, private fb: FormBuilder,) {
    this.formularioEmpleado = this.fb.group({
      fullname: [, Validators.required],
    });
  }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    console.log(this.userRole)
    this.authControlService.getLoggedUser().subscribe(() => {
      this.loggedInUser = this.authControlService.getStoredLoggedInUser();
      this.loadActiveChats()
    });
    this.obtenerEmpleados()

  }


  obtenerEmpleados() {
    this.apiRequestService.getEmployees().subscribe(
      (data: Employee[]) => {
        // Filtrar empleados por nombre de sucursal
        this.employees = data;
        this.filteredEmployees = data;

        this.filteredEmployees.forEach(employee => {
          employee.fullname = employee.name + ' ' + employee.last_name;
        });
        this.ngSelectSeleccionado = event ? true : false;
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
      sender_id: this.loggedInUser?.id,
      receiver_id: this.formularioEmpleado.value.fullname.id,
      message: '' // Mensaje vacío por defecto
    };

    // Enviar la solicitud para crear la nueva conexión
    this.apiRequestService.crearConexion(nuevaConexion).subscribe(
      (response) => {
        // Manejar la respuesta del servidor si es necesario
        console.log('Conexión creada exitosamente:', response);
        // Limpiar la selección de empleado
        this.selectedEmployee = undefined;
        this.loadActiveChats()
      },
      (error) => {
        console.error('Error al crear la conexión:', error);
      }
    );

    // Limpiar la selección de empleado
    this.selectedEmployee = undefined;
  }


  eliminarChat() {
    if (!this.loggedInUser) {
      console.error('No hay empleado seleccionado para eliminar el chat.');
      return;
    }

    // Suponiendo que `selectedEmployee.id` sea el ID de la conexión de chat a eliminar
    const conexionId = this.loggedInUser.id;

    this.apiRequestService.eliminarConexion(conexionId).subscribe(
      (response) => {
        console.log('Conexión eliminada exitosamente:', response);
        this.selectedEmployee = undefined; // Limpiar la selección de empleado
      },
      (error) => {
        console.error('Error al eliminar la conexión:', error);
      }
    );
  }

  loadActiveChats() {
    if (!this.loggedInUser) {
      return;
    }

    this.apiRequestService.getActiveChats(this.loggedInUser.id).subscribe(
      (chats: any[]) => {
        this.activeChats = chats
      },
      (error) => {
        console.error('Error al cargar los chats activos:', error);
      }
    );
  }
  seleccionarChatActivo(chat: any) {
    console.log('hola')
    this.mostrarMensajes = true;
    this.chatActivo = chat;
}
}
