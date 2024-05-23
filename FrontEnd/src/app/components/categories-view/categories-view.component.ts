// Angular Core and other module imports
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Model and service imports
import { Employee } from 'src/app/model/Employee';
import { Category } from 'src/app/model/Category';
import { AttributeCategoryMaterial } from 'src/app/model/AttributeCategoryMaterial';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

// Import of auto-table extension for PDF
import 'jspdf-autotable';

@Component({
  selector: 'app-categories-view',
  templateUrl: './categories-view.component.html',
  styleUrls: ['./categories-view.component.css']
})
export class CategoriesViewComponent implements OnInit {

  // Variable declarations
  categoryForm: FormGroup;
  categories: Category[] = [];
  mostrarModalAgregar: boolean = false;
  mostrarModalEdit: boolean = false;
  categoryID!: number;
  errorMessage!: string;
  errorMessage2!: string;
  successMessage!: string;
  cargaDatos: boolean = true;
  userRole!: any;
  loggedInUser!: Employee | null;
  totales:any = [];

  constructor(
    // Injection of necessary services and modules
    private ApiRequestService: ApiRequestService,
    private authControlService: UsuariosControlService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    // Form initialization
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    // Initialization of data when the component starts
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(
      (user) => {
        this.loggedInUser = user;
      }
    );
    this.obtenerCantidadMaterial();
  }

  // Method to obtain the quantity of materials per category
  obtenerCantidadMaterial(): void {
    this.ApiRequestService.categoryMaterial().subscribe(category => {
      this.categories = category;
      this.calcularTotales();
      this.cargaDatos = false;
    });
  }

  // Method to calculate totals of materials per category
  calcularTotales(): void {
    this.totales = {};
    this.categories.forEach(categoria => {
      if (!this.totales[categoria.name]) {
        this.totales[categoria.name] = {
          totalMateriales: 0,
          available: 0,
          active: 0,
          inactive: 0
        };
      }

      if (categoria.attributeCategoryMaterials) {
        Object.values(categoria.attributeCategoryMaterials).forEach((material: AttributeCategoryMaterial) => {
          switch (material.material?.state) {
            case "available":
              this.totales[categoria.name].available++;
              this.totales[categoria.name].totalMateriales++;
              break;
            case "active":
              this.totales[categoria.name].active++;
              this.totales[categoria.name].totalMateriales++;
              break;
            case "inactive":
              this.totales[categoria.name].inactive++;
              this.totales[categoria.name].totalMateriales++;
              break;
            default:
              break;
          }
        });
      }
    });
  }

  // Method to send the object to category detail
  enviarObjeto(id: number) {
    this.router.navigate(['/categories_details', id]);
  }

  // Method to add a category
  categoryAdd() {
    this.successMessage='';
    this.errorMessage='';
    this.errorMessage2='';
    if (this.categoryForm.valid) {
      const newCategory: Category = this.categoryForm.value;
      this.ApiRequestService.addCategory(newCategory).subscribe(
        (response: any) => {
          this.cerrarModal();
          this.successMessage = response.message;
        },
        (error: any) => {
          this.errorMessage = error.error.error;
        }
      );
    } else {
      this.errorMessage2 = 'Invalid form. Please fill out all required fields.';
    }
  }

  // Method to confirm deletion of a category
  confirmDelete(id:number, name:string): void {
    const confirmacion = confirm(`By deleting the category, ALL MATERIALS WILL BE DELETED, are you sure you want to delete category ${name}?`);
    if (confirmacion) {
      this.deleteCategory(id);
    }
  }

  // Method to delete a category
  deleteCategory(id: number): void {
    this.successMessage='';
    this.errorMessage='';
    this.ApiRequestService.deleteCategory(id).subscribe(
      (response) => {
        this.successMessage = response.message;
        this.obtenerCantidadMaterial();
      },
      error => {
        this.errorMessage = error.error.error;
      }
    );
  }

  // Method to edit a category
  editCategory(): void {
    this.successMessage='';
    this.errorMessage='';
    this.errorMessage2='';
    if (this.categoryForm.valid) {
      const categoryEdit = this.categoryForm.value;
      this.ApiRequestService.editCategory(this.categoryID, categoryEdit).subscribe(
        (response: any) => {
          this.successMessage = response.message;
          this.cerrarModalEdit();
        },
        (error: any) => {
          this.errorMessage = error.error.error;
        }
      );
    } else {
      this.errorMessage2='Invalid form';
    }
  }

  // Method to show add category modal
  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  // Method to show edit category modal
  mostrarModalEditar(id:any) {
    this.categoryID = id;
    this.mostrarModalEdit = true;
  }

  // Method to close edit category modal
  cerrarModalEdit() {
    this.mostrarModalEdit = false;
    this.obtenerCantidadMaterial();
    this.categoryID = 0;
    this.categoryForm.reset();
  }

  // Method to close add category modal
  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.obtenerCantidadMaterial();
    this.categoryForm.reset();
  }
}
