import { Component, OnInit } from '@angular/core';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqsComponent implements OnInit{
  page: number = 1;

  faqs: any [] = [];
  error: string | null = null;
  cargaDatos: boolean = false;
  employeeRole: string = '';
  employeeId: any;
  FaqID!: number  ;

  faqForm: FormGroup;

  mostrarModalAgregar: boolean = false;
  mostrarModalEdit: boolean = false;

  errorMessage!: string;
  errorMessage2: string | null = null; // Declarar errorMessage2 aquí

  successMessage: string | null = null;
  userRole!: any;

  constructor(

    private apiRequestService: ApiRequestService,
    private fb: FormBuilder,
    private authControlService: UsuariosControlService,
    private router: Router

  ) {
    this.faqForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // Check the user role using the authentication control service
    this.userRole = this.authControlService.hasRole();
    
    // Load FAQ details when the component initializes
    this.loadFaqsDetails();
}


loadFaqsDetails(): void {
  // Set cargaDatos to true to indicate that data loading is in progress
  this.cargaDatos = true;
  
  // Fetch FAQ details from the API
  this.apiRequestService.getFaqsDetails().subscribe(
      data => {
          // Assign fetched FAQ details to the 'faqs' array
          this.faqs = data.faqs;
          
          // Set cargaDatos to false to indicate that data loading is complete
          this.cargaDatos = false;
      },
      error => {
          // Log any errors that occur while fetching FAQ details
          console.error('Error al cargar los detalles de las FAQs:', error);
          
          // Set cargaDatos to false to indicate that data loading is complete (even in case of error)
          this.cargaDatos = false;
      }
  );
}

mostrarModalEditar(faq: number): void {
  // Set mostrarModalEdit to true to display the edit modal
  this.mostrarModalEdit = true;
  
  // Set FaqID to the ID of the FAQ being edited
  this.FaqID = faq;
}

mostrarModal(): void {
  // Set mostrarModalAgregar to true to display the add modal
  this.mostrarModalAgregar = true;
}

cerrarModal(): void {
  // Close the add modal and reload FAQ details
  this.mostrarModalAgregar = false;
  this.loadFaqsDetails();
}

cerrarModalEdit(): void {
  // Close the edit modal and reload FAQ details
  this.mostrarModalEdit = false;
  this.loadFaqsDetails();
}

agregarFaq(): void {
  // Reset error and success messages
  this.errorMessage2 = "";
  this.successMessage = "";

  // Check if the FAQ form is valid
  if (this.faqForm.valid) {
      try {
          // If valid, attempt to create a new FAQ using the API
          this.apiRequestService.createFaq(this.faqForm.value).subscribe(
              (response: any) => {
                  // If successful, set the success message and close the add modal
                  this.successMessage = response.message;
                  this.cerrarModal();
              },
              (error: any) => {
                  // If there's an error, set the error message
                  this.errorMessage2 = error.error.error;
              }
          );
      } catch (error) {
          // Catch any errors that occur during the creation of the FAQ
          this.errorMessage2 = 'Error al agregar FAQ: ' + error;
      }
  } else {
      // If the form is invalid, set an error message
      this.errorMessage2 = 'Formulario inválido. Por favor, complete todos los campos requeridos.';
  }
}

confirmDelete(faq: number): void {
  // Display a confirmation dialog before deleting the FAQ
  const confirmacion = confirm(`Esta seguro que quieres eliminarla?`);
  if (confirmacion) {
      // If confirmed, delete the FAQ
      this.deleteFaq(faq);
  }
}

deleteFaq(id: number): void {
  // Delete the FAQ using the API
  this.apiRequestService.deleteFaq(id).subscribe(
      (response: any) => {
          // If successful, set the success message and reload FAQ details
          this.successMessage = response.message;
          this.loadFaqsDetails();
      },
      error => {
          // If there's an error, set the error message
          this.errorMessage = error.error.error;
      }
  );
}

editFaq(): void {
  // Check if the FAQ form is valid
  if (this.faqForm.valid) {
      // If valid, construct the updated FAQ data
      const faqEditData = {
          titulo: this.faqForm.value.titulo,
          descripcion: this.faqForm.value.descripcion
      };

      // Edit the FAQ using the API
      this.apiRequestService.editFaq(this.FaqID, faqEditData).subscribe(
          (response: any) => {
              // If successful, set the success message, close the edit modal, and reload FAQ details
              this.successMessage = response.message;
              this.cerrarModalEdit();
              this.loadFaqsDetails();
          },
          (error: any) => {
              // If there's an error, set the error message
              this.errorMessage = error.error.error;
          }
      );
  } else {
      // If the form is invalid, log an error message
      console.error('Formulario inválido');
  }
}


}

