import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from 'src/app/model/Employee';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.css']
})
export class ChatViewComponent implements OnInit {
  loggedInUser: Employee | null = null;
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
  nuevoMensaje: string = '';

  constructor(private authControlService: UsuariosControlService, private apiRequestService: ApiRequestService, private fb: FormBuilder,) {
    this.formularioEmpleado = this.fb.group({
      fullname: [, Validators.required],
    });
  }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(() => {
      this.loggedInUser = this.authControlService.getStoredLoggedInUser();
      this.loadActiveChats()
    });
    this.obtenerEmpleados()
  }

  obtenerEmpleados() {
    this.apiRequestService.getEmployees().subscribe(
      (data: Employee[]) => {
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
    const nuevaConexion = {
      sender_id: this.loggedInUser?.id,
      receiver_id: this.formularioEmpleado.value.fullname.id,
      message: ''
    };

    this.apiRequestService.crearConexion(nuevaConexion).subscribe(
      (response) => {
        this.selectedEmployee = undefined;
        this.loadActiveChats()
      },
      (error) => {
        console.error('Error al crear la conexión:', error);
      }
    );
    this.selectedEmployee = undefined;
  }

  eliminarChat(id: number) {
    this.apiRequestService.eliminarConexion(id).subscribe(
      (response) => {
        this.cerrarModal()
        this.selectedEmployee = undefined;
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
        this.activeChats = chats;
      },
      (error) => {
        console.error('Error al cargar los chats activos:', error);
      }
    );
  }

  seleccionarChatActivo(chat: any) {
    this.mostrarMensajes = true;
   
      this.chatActivo = chat;
    
   
  
  }

  enviarMensaje() {
    if (this.nuevoMensaje.trim() !== '') {
      const prefijo = this.loggedInUser?.id === this.chatActivo.sender_id ? 'S: ' : 'R: ';
      const mensajeFormateado = `${prefijo}${this.nuevoMensaje.trim()}`;
      this.chatActivo.message = this.chatActivo.message ? this.chatActivo.message + '\n' + mensajeFormateado : mensajeFormateado;

      // Actualizar el chat en la base de datos
      this.apiRequestService.actualizarMensaje(this.chatActivo.id, this.chatActivo.message).subscribe(
        response => {
         
          this.nuevoMensaje = '';
        },
        error => {
          console.error('Error al actualizar el mensaje:', error);
        }
      );
    }
  }
  cerrarModal(){
    this.mostrarMensajes = false;
    this.loadActiveChats()
  }

  obtenerUltimaLinea(message: string): string {
    if (!message) return ''; // Si no hay mensaje, retorna una cadena vacía
  
    // Dividir el mensaje por saltos de línea y obtener la última línea
    const lineas = message.split('\n');
    return lineas[lineas.length - 1].slice(2); // Obtener la última línea del mensaje
  }
}
