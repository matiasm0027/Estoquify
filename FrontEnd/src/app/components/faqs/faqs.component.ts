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
  FaqID: number = 0 ;

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
    this.userRole = this.authControlService.hasRole();
  }

  loadFaqsDetails(): void {
    this.cargaDatos = true;
    this.apiRequestService.getFaqsDetails().subscribe(data => {
      this.faqs = data.faqs;
      this.cargaDatos = false;
    }, error => {
      console.error('Error al cargar los detalles de las FAQs:', error);
      this.cargaDatos = false;
    });
  }

  mostrarModalEditar(id:any) {
    this.mostrarModalEdit = true;
    this.FaqID = id;
  }

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  cerrarModal() {
    this.mostrarModalAgregar = false;
  }
  cerrarModalEdit() {
    this.mostrarModalEdit = false;
 
  }


  agregarFaq(): void {
    this.errorMessage2 = "";
    this.successMessage = "";
    
    if (this.faqForm.valid) {
      try {
        this.apiRequestService.createFaq(this.faqForm.value).subscribe(
          (response: any) => {
            this.successMessage = response.message;
            this.cerrarModal();
          },
          (error: any) => {
            this.errorMessage2 = error.error.error;
            // No realizar ninguna acción adicional en caso de error
          }
        );
      } catch (error) {
        this.errorMessage2 = 'Error al agregar FAQ: ' + error;
        // No realizar ninguna acción adicional en caso de error
      }
    } else {
      this.errorMessage2 = 'Formulario inválido. Por favor, complete todos los campos requeridos.';
    }
  }
  
  

confirmDelete(faq: any): void {
  const confirmacion = confirm(` ${faq.titulo}?`);
  if (confirmacion) {
    this.deleteFaq(faq.id);
  }
}

deleteFaq(id:number): void {
  this.apiRequestService.deleteFaq(id).subscribe(
    (response) => {
      this.successMessage = response.message;
    },
    error => {
      this.errorMessage = error.error.error;
    }
  );
}

editFaq(): void {
  if (this.faqForm.valid) {
    const faqEdit = {
      titulo: this.faqForm.value.titulo,
      descripcion: this.faqForm.value.descripcion
    };

    this.apiRequestService.editFaq(this.FaqID, faqEdit).subscribe(
      (response: any) => {
        this.successMessage = response.message;
        this.cerrarModalEdit();
        // Realiza cualquier otra acción necesaria después de editar el FAQ
      },
      (error: any) => {
        this.errorMessage = error.error.error;
        // Maneja el error de alguna manera, como mostrando un mensaje de error al usuario
      }
    );
  } else {
    // Si el formulario no es válido, puedes mostrar un mensaje de error o realizar alguna otra acción
    console.error('Formulario inválido');
  }
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
