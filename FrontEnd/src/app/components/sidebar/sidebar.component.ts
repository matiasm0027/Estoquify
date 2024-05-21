import { Component, OnInit } from '@angular/core';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { Employee } from 'src/app/model/Employee';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  loggedInUser: Employee | null = null; // Inicializar con un valor nulo
  userRole!: any;
  showChatModal: boolean = false;
  public messages: { from: string, message: string }[] = [];
  public message: string = '';
  public recipient: string = ''; // Usuario destinatario

  constructor(private authControlService: UsuariosControlService, private socketService: SocketService) {}

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(() => {
      this.loggedInUser = this.authControlService.getStoredLoggedInUser();
      if (this.loggedInUser && this.loggedInUser.name) {
        this.socketService.login(this.loggedInUser.name);
      }
    });
    this.socketService.getMessages().subscribe((data) => {
      console.log(data)
      this.messages.push(data);
    });
  }

  sendMessage(): void {
    if (this.message.trim() !== '' && this.recipient.trim() !== '') {
      const name = this.loggedInUser?.name ?? 'Me';
      this.socketService.sendMessage(this.recipient, this.message);
      this.messages.push({ from: name, message: this.message });
      this.message = '';
    }
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
}
