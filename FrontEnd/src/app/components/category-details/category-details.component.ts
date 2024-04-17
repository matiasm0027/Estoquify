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
  formularioCategoria!: FormGroup;
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;
  mostrarModalAgregar: boolean = false;
  mostrarModalFiltros: boolean = false;
  sucursales: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private categoryService: ApiRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCategoriaIdFromRoute();
    this.getCategoriaDetails();
    this.obtenerSucursales();
  }

  initForm() {
    this.formularioCategoria = this.fb.group({
      nombre: [this.categoryDetails.name, Validators.required],
      descripcion: [this.categoryDetails.description, Validators.required],
      // Otros campos de formulario para la categoría
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarWidth = this.sidebarVisible ? 250 : 0;
  }

  obtenerSucursales() {
    this.categoryService.listBranchOffices().subscribe(
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
    this.categoryService.getCategoriaDetails(this.categoryId)
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

 

 

  // Otras funciones como confirmar eliminación y eliminar categoría
}
