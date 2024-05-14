import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-categories-view',
  templateUrl: './categories-view.component.html',
  styleUrls: ['./categories-view.component.css']
})
export class CategoriesViewComponent implements OnInit, OnDestroy{
  categoryForm: FormGroup;
  materials: any[] = [];
  mostrarModalAgregar: boolean = false;
  mostrarModalEdit: boolean = false;
  categoryID: string = "" ;
  errorMessage!: string;
  successMessage!: string;
  employeeRole!: string;
  employeeId!: number;
  cargaDatos: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private ApiRequestService: ApiRequestService,
    private fb: FormBuilder,
    )
  {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    this.obtenerCantidadMaterial();
    this.getLoggedUser();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
          this.clearMessagesAfterDelay();
        },
        (error: any) => {
          this.errorMessage = error.error.error;
          this.clearMessagesAfterDelay();
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
        this.clearMessagesAfterDelay();
      },
      error => {
        this.errorMessage = error.error.error;
        this.clearMessagesAfterDelay();
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
          this.clearMessagesAfterDelay();
        },
        (error: any) => {
          this.errorMessage = error.error.error;
          this.clearMessagesAfterDelay();
        }
      );
    } else {
      // Si el formulario no es válido, puedes mostrar un mensaje de error o realizar alguna otra acción
      console.error('Formulario inválido');
    }
  }

  clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 2000);
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

  getLoggedUser(): void {
    this.ApiRequestService.me().subscribe(
      (response: any) => {
        this.employeeId = response.id;
        const roleId = response.role_id;


        if (roleId === 1) {
          this.employeeRole = 'admin';
        } else if (roleId === 2){
          this.employeeRole = 'manager';
        }
        this.cargaDatos = false;

      },
      error => {
        console.error('Error when obtaining data from the logged in user:', error);
      }
    );
  }

}



