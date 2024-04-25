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
    this.getLoggedUser();
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
      }
    );
  }

  toggleCheckbox(selectedCheckbox: string) {
    this.petition = '';
    if (selectedCheckbox === 'altaEmpleado' && this.altaEmpleado) {
        this.solicitudMaterial = false; // Desselecciona Solicitud Material si se selecciona Alta Empleado
        this.onAltaEmpleado();
    } else if (selectedCheckbox === 'solicitudMaterial' && this.solicitudMaterial) {
        this.altaEmpleado = false; // Desselecciona Alta Empleado si se selecciona Solicitud Material
        this.onCategoriaChange()
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
  const date = new Date().toISOString().slice(0, 10);
  const type = this.altaEmpleado ? 'Alta Empleado' : 'Solicitud Material'; // Determina el tipo según la selección del usuario
  try {
      let reporte;
      if (type === 'Alta Empleado') {
          reporte = {
              date: date,
              type: type,
              petition: this.petition,
              state: 'pending',
              priority: this.getPriority(),
              employee_id: this.employeeId
          };
      } else {
          reporte = {
              date: date,
              type: type,
              petition: this.petition,
              state: 'pending',
              priority: this.getPriority(),
              employee_id: this.employeeId,
              category: this.getCategoriasSeleccionadasIds()
          };
      }
      this.apiRequestService.agregarReporte(reporte).subscribe(
        (response: any) => {
          console.log('Reporte agregado:', response);
          this.resetForm();
        },
        (error: any) => {
          console.error('Error al agregar el reporte:', error);
        }
      );
    
  } catch (error) {
      console.error("Error al agregar el reporte:", error);
      // Maneja el error de acuerdo a tus necesidades, por ejemplo, mostrar un mensaje al usuario
  }
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

getCategoriasSeleccionadasIds(): number[] {
  const categoriasSeleccionadasIds: number[] = [];
  for (const categoriaId in this.categoriasSeleccionadas) {
    if (this.categoriasSeleccionadas[categoriaId]) {
      categoriasSeleccionadasIds.push(parseInt(categoriaId));
    }
  }
  return categoriasSeleccionadasIds;
}

getCategoriasSeleccionadas(): { id: number, name: string }[] {
  const categoriasSeleccionadas: { id: number, name: string }[] = [];
  for (const categoriaId in this.categoriasSeleccionadas) {
    if (this.categoriasSeleccionadas[categoriaId]) {
      const categoria = this.categories.find(cat => cat.id === parseInt(categoriaId));
      if (categoria) {
        categoriasSeleccionadas.push({ id: parseInt(categoriaId), name: categoria.name });
      }
    }
  }
  return categoriasSeleccionadas;
}

onAltaEmpleado() {
  const datos = ['Nombre:', 'Apellido:', 'Email:', 'Teléfono Móvil:', 'Departamento:', 'Sucursal:', 'Rol:'];
  this.petition = datos.join('\n');
}

onCategoriaChange() {
  this.petition = this.formatSelectedCategories();
}

formatSelectedCategories() {
  if (this.solicitudMaterial) {
    const selectedCategories = this.getCategoriasSeleccionadas();
    let formattedCategories = selectedCategories.map(c => c.name + ':'); // Agregar ":" después de cada nombre de categoría
    return formattedCategories.join('\n'); // Unir las categorías con saltos de línea
  } else {
    return '';
  }
}

resetForm() {
  // Reiniciar los valores de los campos del formulario
  this.petition = ''; 
  this.altaEmpleado = false; 
  this.solicitudMaterial = false; 
  this.prioridadLow = false; 
  this.prioridadMedium = false; 
  this.prioridadHigh = false; 
  this.categoriasSeleccionadas = {}; 

}
}