import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent {
  categoryId!: number;
  categoryDetails: any ={};
  formularioEmpleado!: FormGroup;


  constructor(
    private fb: FormBuilder,
    private categoryService: ApiRequestService,
  ){}


  ngOnInit(): void {
    this.getCategoryDetails
  }

  initForm() {
    this.formularioEmpleado = this.fb.group({
      nombre: [this.categoryDetails.name, Validators.required],
      apellido: [this.categoryDetails.last_name, Validators.required],
      email: [this.categoryDetails.email, [Validators.required, Validators.email]],
      departamento: [this.categoryDetails.department, Validators.required],
      sucursal: [this.categoryDetails.branch_office, Validators.required],
      rol: [this.categoryDetails.role, Validators.required],
      telefonoMovil: [this.categoryDetails.phone_number]
    });
  }


  getCategoryDetails(): void {
    this.categoryService.getEmployeeDetails(this.categoryId)
      .subscribe(
        (employee: any) => {
          this.categoryDetails = employee;
          this.initForm(); // Initialize form after employee details are fetched
        },
        (error: any) => {
          console.error('Error al obtener detalles del empleado:', error);
        }
      );
  }

  
}
  
