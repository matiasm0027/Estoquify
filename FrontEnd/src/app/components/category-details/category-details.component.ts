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
  categoryName!: number;
  categoryDetails: any ={};
  formularioEmpleado!: FormGroup;


  constructor(
    private ApiRequestService: ApiRequestService,
    private fb: FormBuilder,
    private categoryService: ApiRequestService,
  ){}


  ngOnInit(): void {
    this.ObtenerCategoryDetails
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


    ObtenerCategoryDetails(){
    this.ApiRequestService.MaterialDetails().subscribe(
        (response: any[]) => {
          this.categoryDetails = response;
        },
      );
  }  
}
  
