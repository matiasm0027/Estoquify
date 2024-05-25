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

  loggedInUser!: Employee | null;
  userRole!: any;
  
   
  constructor(private authControlService: UsuariosControlService,  private apiRequestService: ApiRequestService) {}

  // Initialize component
ngOnInit(): void {
  // Check user role using the authentication control service
  this.userRole = this.authControlService.hasRole();
  // Subscribe to get the logged-in user information
  this.authControlService.getLoggedUser().subscribe(
    // Handle successful response
    (user) => {
      // Set logged-in user information
      this.loggedInUser = user;
    }
  );
}

// Function to log out the user
logout(): void {
  // Call the logout method of the authentication control service
  this.authControlService.logout();
  // Reload the window to reflect logout changes
  window.location.reload();
}

// Function to toggle the sidebar visibility
toggleSidebar(): void {
  // Get the sidebar element by its ID
  const sidebar = document.getElementById('logo-sidebar');
  // Toggle the 'hidden' class of the sidebar
  if (sidebar) {
    sidebar.classList.toggle('hidden');
  }
}




}
