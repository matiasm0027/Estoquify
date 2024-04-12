import { Component, OnInit } from '@angular/core';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-categories-view',
  templateUrl: './categories-view.component.html',
  styleUrls: ['./categories-view.component.css']
})
export class CategoriesViewComponent implements OnInit{
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;

  materials: any[] = [];
  mostrarModalAgregar: boolean = false;

  constructor(private ApiRequestService: ApiRequestService) {}
  
  ngOnInit(): void {
    this.obtenerCantidadMaterial();
  }

  

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    if (this.sidebarVisible) {
      this.sidebarWidth = 250; // Ancho del sidebar cuando es visible
    } else {
      this.sidebarWidth = 0; // Ancho del sidebar cuando es invisible
    }
  }

  obtenerCantidadMaterial(){
    this.ApiRequestService.categoryMaterialInfo().subscribe(
      (response: any[]) => {
        this.materials = response.map(material => ({
          name: material.category_name, // Cambiar a category_name
          total_material: material.total_materials, // Cambiar a total_materials
          activeMaterial: material.active_materials, // Cambiar a active_materials
          availableMaterial: material.available_materials, // Cambiar a available_materials
          inactiveMaterial: material.inactive_materials // Cambiar a inactive_materials
        }));
      }
    );
  }

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }


}



