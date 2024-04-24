import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-reportes-view',
  templateUrl: './reportes-view.component.html',
  styleUrls: ['./reportes-view.component.css']
})
export class ReportesViewComponent implements OnInit {
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;
  categories: any[] = [];
  altaEmpleado: boolean = false;
  solicitudMaterial: boolean = false;
  categoriasSeleccionadas: { [key: string]: boolean } = {};
  prioridadLow: boolean = false;
  prioridadMedium: boolean = false;
  prioridadHigh: boolean = false;
  employeeId!: number;
  petition: string = '';

  constructor(
    private apiRequestService: ApiRequestService,
    private fb: FormBuilder,
    ) 
  {}

  ngOnInit(): void {
    this.obtenerNombreCategoria();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarWidth = this.sidebarVisible ? 250 : 0;
  }

  obtenerNombreCategoria(){
    this.apiRequestService.categoryMaterialInfo().subscribe(
      (response: any[]) => {
        this.categories = response.map(material => ({
          id: material.category_id,
          name: material.category_name, // Cambiar a category_name
        }));
        console.log(this.categories)
      }
    );
  }

  toggleCheckbox(selectedCheckbox: string) {
    if (selectedCheckbox === 'altaEmpleado' && this.altaEmpleado) {
        this.solicitudMaterial = false; // Desselecciona Solicitud Material si se selecciona Alta Empleado
    } else if (selectedCheckbox === 'solicitudMaterial' && this.solicitudMaterial) {
        this.altaEmpleado = false; // Desselecciona Alta Empleado si se selecciona Solicitud Material
    }
}

togglePriority(selectedPriority: string) {
  if (selectedPriority === 'prioridadLow' && this.prioridadLow) {
      this.prioridadMedium = false;
      this.prioridadHigh = false;
  } else if (selectedPriority === 'prioridadMedium' && this.prioridadMedium) {
      this.prioridadLow = false;
      this.prioridadHigh = false;
  } else if (selectedPriority === 'prioridadHigh' && this.prioridadHigh) {
      this.prioridadLow = false;
      this.prioridadMedium = false;
  }
}

getLoggedUser(): void {
  this.apiRequestService.me().subscribe(
    (response: any) => {
      this.employeeId = response.id;
    },
    error => {
      console.error('Error when obtaining data from the logged in user:', error);
    }
  );
}

agregarReporte() {
  const date = new Date();
  const reporte = {
      date: date,
      petition: this.petition,
      state: 'pending',
      priority: this.getPriority(),
      employee_id: this.employeeId,
      category: this.getCategoriasSeleccionadas()
  };
  console.log("Reporte a enviar:", reporte);
  // Aquí puedes enviar el reporte a través de tu servicio API
}

getPriority(): string {
  if (this.prioridadLow) {
      return 'Low';
  } else if (this.prioridadMedium) {
      return 'Medium';
  } else if (this.prioridadHigh) {
      return 'High';
  } else {
      return ''; // No se ha seleccionado ninguna prioridad
  }
}

getCategoriasSeleccionadas(): string[] {
  const categoriasSeleccionadas = [];
  for (const categoria in this.categoriasSeleccionadas) {
      if (this.categoriasSeleccionadas[categoria]) {
          categoriasSeleccionadas.push(categoria);
      }
  }
  return categoriasSeleccionadas;
}
}
