import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent implements OnInit {
  categoryId!: number;
  categoryDetails: any = {};
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;
  mostrarModalAgregar: boolean = false;
  mostrarModalFiltros: boolean = false;
  sucursales: any[] = [];
  formularioMaterial!: FormGroup;
  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ApiRequestService: ApiRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCategoriaIdFromRoute();
    this.getCategoriaDetails();
    this.obtenerSucursales();
    this.initForm();
  }

  initForm() {
    this.formularioMaterial = this.fb.group({
      nombre: ['', Validators.required],
      value: ['', Validators.required],
      sucursal: ['', Validators.required],
      atributo: ['', Validators.required]
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarWidth = this.sidebarVisible ? 250 : 0;
  }

  obtenerSucursales() {
    this.ApiRequestService.listBranchOffices().subscribe(
      (response: any[]) => {
        this.sucursales = response;
        
      },
      error => {
        console.error('Error al obtener sucursales:', error);
      }
    );
  }

  getNombreSucursal(branch_office_id: number): string {
    const sucursal = this.sucursales.find(suc => suc.id === branch_office_id);
    return sucursal ? sucursal.name : 'N/A';
  }

  getCategoriaIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id'];
    });
  }

  getCategoriaDetails(): void {
    this.ApiRequestService.getCategoriaDetails(this.categoryId)
      .subscribe(
        (categoria: any) => {
          console.log(categoria)
          this.categoryDetails = categoria; // Convertir el objeto de categoría a una matriz
        },
        (error: any) => {
          console.error('Error al obtener detalles de la categoría:', error);
        }
      );
  }

  volver() {
    this.router.navigate(['/categories_view']);
  }

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  mostrarModalDeFiltros(): void {
    this.mostrarModalFiltros = true;
  }

  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.getCategoriaDetails();
    this.formularioMaterial.reset();
  }

  agregarMaterial() {
    if (this.formularioMaterial.valid) {
      const nombre = this.formularioMaterial.value.nombre;
      const valor = this.formularioMaterial.value.value;
      const sucursal = this.formularioMaterial.value.sucursal;
      const atributoId = this.formularioMaterial.value.atributo; // Obtener el ID del atributo seleccionado
    
      // Crear el objeto del material con los valores proporcionados
      const nuevoMaterial = {
        material:{
          name: nombre,
          high_date: new Date().toISOString(), // Obtener la fecha actual
          branch_office_id: sucursal,
          pivot: {
            category_id: this.categoryId, // Supongo que necesitas el ID de la categoría
            attribute_id: atributoId,
            value: valor
          },
          state: "available"
        },
        category_id: this.categoryId,
        category_name: "",
        attributes:{
          name: "", //quiero el name del atributo que he elegido
          pivot: {
            category_id: this.categoryId, // Supongo que necesitas el ID de la categoría
            attribute_id: atributoId, // Agregar el ID del atributo seleccionado
            value: valor
          },
        } 
      };
  
      this.ApiRequestService.getAttributeName(atributoId).subscribe(
        (response: any) => {
          nuevoMaterial.attributes.name = response.name; // Asignar el nombre del atributo seleccionado
          // Llamar al servicio para obtener el nombre de la categoría
          this.ApiRequestService.getCategoryName(this.categoryId).subscribe(
            (response: any) => {
              nuevoMaterial.category_name = response.category_name;
              // Llamar al servicio para agregar el material
              console.log(nuevoMaterial)
              this.ApiRequestService.agregarMaterial(nuevoMaterial).subscribe(
                (response: any) => {
                  console.log('Material agregado:', response);
                  // Cerrar el modal y limpiar el formulario
                  this.cerrarModal();
                },
                (error: any) => {
                  console.error('Error al agregar el material:', error);
                }
              );
            },
            (error: any) => {
              console.error('Error al obtener el nombre de la categoría:', error);
            }
          );
        },
        (error: any) => {
          console.error('Error al obtener el nombre del atributo:', error);
        }
      );
    } else {
      // Marcar los campos inválidos
      this.formularioMaterial.markAllAsTouched();
    }
  }

  obtenerCategorias(){
    this.ApiRequestService.categoryMaterialInfo().subscribe(
      (response: any[]) => {
        this.categories = response.map(categori => ({
          id: categori.category_id,
          name: categori.category_name, // Cambiar a category_name
          total_material: categori.total_materials, // Cambiar a total_materials
          activeMaterial: categori.active_materials, // Cambiar a active_materials
          availableMaterial: categori.available_materials, // Cambiar a available_materials
          inactiveMaterial: categori.inactive_materials // Cambiar a inactive_materials
        }));
      }
    );
  }

  // Otras funciones como confirmar eliminación y eliminar categoría
}
