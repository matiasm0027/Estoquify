import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from 'src/app/model/Employee';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-categories-view',
  templateUrl: './categories-view.component.html',
  styleUrls: ['./categories-view.component.css']
})
export class CategoriesViewComponent implements OnInit{
  categoryForm: FormGroup;
  materials: any[] = [];
  mostrarModalAgregar: boolean = false;
  mostrarModalEdit: boolean = false;
  categoryID: string = "" ;
  errorMessage!: string;
  successMessage!: string;
  cargaDatos: boolean = true;
  userRole!: any;
  loggedInUser: Employee | null = null;

  constructor(
    private ApiRequestService: ApiRequestService,
    private authControlService: UsuariosControlService,
    private fb: FormBuilder,
    )
  {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(() => {
      this.loggedInUser = this.authControlService.getStoredLoggedInUser();
    });
    this.obtenerCantidadMaterial();
  }

  obtenerCantidadMaterial(){
    this.ApiRequestService.categoryMaterialInfo().subscribe(
      (response: any[]) => {
        this.materials = response.map(material => ({
          id: material.id,
          name: material.name,
          total_material: material.total_materials,
          activeMaterial: material.active_materials,
          availableMaterial: material.available_materials,
          inactiveMaterial: material.inactive_materials
        }));
        this.cargaDatos = false;
      }
    );
  }

  categoryAdd() {
    if (this.categoryForm.valid) {
      const newCategory = this.categoryForm.value;
      this.ApiRequestService.addCategory(newCategory).subscribe(
        (response: any) => {
          this.cerrarModal();
          this.successMessage = response.message;
        },
        (error: any) => {
          this.errorMessage = error.error.error;
        }
      );
    }
  }

  confirmDelete(category: any): void {
    const confirmacion = confirm(`¿Al eliminar la categoria se eliminaran TODOS LOS MATERIALES, estás seguro de que quieres eliminar la categoria ${category.name}?`);
    if (confirmacion) {
      this.deleteCategory(category.id);
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
    if (this.categoryForm.valid) {
      const categoryEdit = {
        name: this.categoryForm.value.name,
      };

      this.ApiRequestService.editCategory(this.categoryID, categoryEdit).subscribe(
        (response: any) => {
          this.successMessage = response.message;
          this.cerrarModalEdit();
          this.obtenerCantidadMaterial();
        },
        (error: any) => {
          this.errorMessage = error.error.error;
        }
      );
    } else {
      // Si el formulario no es válido, puedes mostrar un mensaje de error o realizar alguna otra acción
      console.error('Formulario inválido');
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
    this.categoryID = "";
    this.categoryForm.reset();
  }

  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.obtenerCantidadMaterial();
    this.categoryForm.reset();
  }
}



