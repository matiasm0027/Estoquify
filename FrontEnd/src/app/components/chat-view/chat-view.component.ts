import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//DESPUES DE LA SUBIDA DEL SERVIDOR
import { Subscription } from 'rxjs';
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
  chatElegido: any;
  mostrarMensajes: boolean = false;
  nuevoMensaje: string = '';
  //DESPUES DE LA SUBIDA DEL SERVIDOR
  pollingInterval: any;
  private subscriptions: Subscription = new Subscription();

  constructor(private authControlService: UsuariosControlService, private apiRequestService: ApiRequestService, private fb: FormBuilder,) {
    // Initializing the employee form with form controls and validators
    this.formularioEmpleado = this.fb.group({
      fullname: [, Validators.required],
    });
  }

  ngOnInit(): void {
    // Getting the user role using authentication control service
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(() => {
      this.loggedInUser = this.authControlService.getStoredLoggedInUser();
      this.loadActiveChats()
    });
    this.obtenerEmpleados()
  }

  // Function to obtain employees from the API
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

  // Function to search for employees based on input term
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

  // Function to select an employee
  seleccionarEmpleado(employee: Employee) {
    this.selectedEmployee = employee;
    this.placeholder = '';
    this.filteredEmployees = this.employees;
  }

  // Function to clear employee selection
  limpiarSeleccion() {
    this.selectedEmployee = undefined;
  }

  // Function to create a connection (chat) with the selected employee
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

  // Function to delete a chat connection
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

  // Function to load active chats
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

  // Function to select an active chat
  seleccionarChatActivo(chat: any) {
    this.mostrarMensajes = true;
    this.chatElegido = chat;
    this.chatActivo = chat; // Asignar también a this.chatActivo
    //DESPUES DE LA SUBIDA DEL SERVIDOR
    this.iniciarPolling(this.chatElegido.id)
  }

  // Function to send a message in the active chat
  enviarMensaje() {
    if (this.nuevoMensaje.trim() !== '') {
      const prefijo = this.loggedInUser?.id === this.chatActivo.sender_id ? 'S: ' : 'R: ';
      const mensajeFormateado = `${prefijo}${this.nuevoMensaje.trim()}`;
      this.chatActivo.message = this.chatActivo.message ? this.chatActivo.message + '\n' + mensajeFormateado : mensajeFormateado;

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

 // Function to close the modal and reload active chats
 cerrarModal() {
  this.mostrarMensajes = false;
  this.loadActiveChats();
  //DESPUES DE LA SUBIDA DEL SERVIDOR
  if (this.pollingInterval) {
    clearInterval(this.pollingInterval);
  }
}

// Function to start polling for active chat messages
//DESPUES DE LA SUBIDA DEL SERVIDOR
iniciarPolling(id: number) {
  this.pollingInterval = setInterval(() => {
    this.obtenerMensajesChatActivo(id);
  }, 2000); // Poll every 2 seconds
}

 // Function to obtain the messages of the active chat
 //DESPUES DE LA SUBIDA DEL SERVIDOR
 obtenerMensajesChatActivo(id: number) {
    this.subscriptions.add(
      this.apiRequestService.obtenerMensajes(id).subscribe(
        response => {
          this.chatActivo.message = response;  
        },
        error => {
          console.error('Error al obtener los mensajes:', error);
        }
      )
    );
  
}

  // Function to obtain the last line of a message
  obtenerUltimaLinea(message: String): String {
    if (!message) return '';

    const lineas = message.split('\n');
    let ultimaLinea = lineas[lineas.length - 1].slice(2);
    let textoLimitado = this.limitarTexto(ultimaLinea, 30); 
    return textoLimitado;
  }
 limitarTexto(texto: String, limite: number) {
    if (texto.length > limite) {
        return texto.slice(0, limite) + "...";
    } else {
        return texto;
    }
}
}
