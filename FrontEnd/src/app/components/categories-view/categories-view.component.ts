import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from 'src/app/model/Employee';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { Category } from 'src/app/model/Category';
import { Material } from 'src/app/model/Material';
import { AttributeCategoryMaterial } from 'src/app/model/AttributeCategoryMaterial';
import 'jspdf-autotable';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories-view',
  templateUrl: './categories-view.component.html',
  styleUrls: ['./categories-view.component.css']
})
export class CategoriesViewComponent implements OnInit{
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
    private ApiRequestService: ApiRequestService,
    private authControlService: UsuariosControlService,
    private fb: FormBuilder,
    private router: Router,
    )
  {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(
      (user) => {
        this.loggedInUser = user;
      }
    );
    this.obtenerCantidadMaterial();
  }

  obtenerCantidadMaterial(){
    this.ApiRequestService.categoryMaterialInfo().subscribe(category => {
      this.categories = category;
      console.log(this.categories[0])
        this.calcularTotales();
        this.cargaDatos = false;
      }
    );
  }

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

  enviarObjeto(id: number, category: Category) {
    this.authControlService.setCategory(category);
    this.router.navigate(['/categories_details', id]);
  }

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
    }else{
      this.errorMessage2 = 'Formulario inválido. Por favor, complete todos los campos requeridos.';
    }
  }

  confirmDelete(id:number, name:string): void {
    const confirmacion = confirm(`¿Al eliminar la categoria se eliminaran TODOS LOS MATERIALES, estás seguro de que quieres eliminar la categoria ${name}?`);
    if (confirmacion) {
      this.deleteCategory(id);
    }
  }

  deleteCategory(id: number): void {
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
          //this.obtenerCantidadMaterial();
        },
        (error: any) => {
          this.errorMessage = error.error.error;
        }
      );
    } else {
      this.errorMessage2='Formulario inválido';
    }
  }

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  mostrarModalEditar(id:any) {
    this.categoryID = id;
    this.mostrarModalEdit = true;
  }

  cerrarModalEdit() {
    this.mostrarModalEdit = false;
    this.obtenerCantidadMaterial();
    this.categoryID = 0;
    this.categoryForm.reset();
  }

  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.obtenerCantidadMaterial();
    this.categoryForm.reset();
  }
}



