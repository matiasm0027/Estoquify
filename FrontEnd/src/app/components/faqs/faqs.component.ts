import { Component, OnInit } from '@angular/core';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Faq } from 'src/app/model/Faq';


@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqsComponent implements OnInit{
  faqsDetails!: Faq[];
  faqs: { titulo: string, descripcion: string }[] = [];
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;
  employeeRole!:string;
  employeeId!:number;
  cargaDatos: boolean = true;

  userRole!: any;

  mostrarModalAgregar: boolean = false;
  
  
  errorMessage: string = '';
  errorMessage2: string = '';
  successMessage: string = '';
  apiService: any;
  formularioFaq: any;
  faqDetails: any;

  constructor(

    private apiRequestService: ApiRequestService
  
  ) {}


  initForm(){
    Title:[this.]
  }

  ngOnInit(): void {
    this.getFaqsDetails();

  }

  getFaqsDetails(): void {
    this.apiService.getFaqsDetails().subscribe(
      (response) => {
        this.faqs = response.faqs;
      },
      (error: any) => {
        this.error = error.error ? error.error : 'An error occurred while fetching FAQs';
      }
    );
  }

  addFaq():void {
    const faqData = {
      titulo: 'Example Title',
      descripcion: 'Example Description'
    };

    this.apiService.addFaq(faqData).subscribe(
      (response) => {
        console.log('FAQ added successfully:', response);
        // Handle success, if needed
      },
      (error) => {
        console.error('Error adding FAQ:', error);
        // Handle error, if needed
      }
    );
  }

  editarFaq(): void {
    this.successMessage = '';
    this.errorMessage = '';
    if (this.formularioFaq.valid) {
      const faqEditada: Faq = this.formularioFaq.value;
      faqEditada.id = this.faqDetails[0].id; // Ajusta según tu estructura de datos
      this.apiService.editFaq(this.faqDetails[0].id, faqEditada).subscribe(
        (response: ApiResponse) => {
          this.successMessage = response.message || 'FAQ editada exitosamente';
          this.cerrarModal();
          this.obtenerDetallesFaq();
        },
        (error: any) => {
          this.errorMessage = error.error.error || 'Error al editar FAQ';
        }
      );
    } else {
      this.errorMessage = 'Formulario inválido. Por favor, complete todos los campos requeridos.';
    }
  }

  obtenerDetallesFaq() {
    throw new Error('Method not implemented.');
  }

  deleteFaq(faqId: number) {
    this.apiService.deleteFaq(faqId).subscribe(
      (response: any) => {
        console.log('FAQ deleted successfully:', response);
        // Handle success, if needed
      },
      (error: any) => {
        console.error('Error deleting FAQ:', error);
        // Handle error, if needed
      }
    );
  }


mostrarModal() {
    // this.mostrarModalAgregar = true;
  }

  cerrarModal() {
    // this.mostrarModalAgregar = false;
  }


  getLoggedUser(): void {
    this.apiRequestService.getLoggedInUser().subscribe(
      (response: any) => {
        this.employeeId = response.id;
        const roleId = response.role_id;
        this.cargaDatos = false;


        if (roleId === 1) {
          this.employeeRole = 'admin';
        } else if (roleId === 2) {
          this.employeeRole = 'manager';
        }else if (roleId === 3) {
          this.employeeRole = 'user';
        }
      },
      error => {
        console.error('Error when obtaining data from the logged in user:', error);
      }
    );
  }

}

