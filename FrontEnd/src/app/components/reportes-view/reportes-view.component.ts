import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  employeeRole!: string;
  reportes: any[] = [];
  sucursales: any[] = [];
  envioExitoso: boolean = false;
  mensajeNotificacion: string = '';
  reporteSeleccionado: any = null;
  formularioEmpleado: FormGroup;
  departamentos: any[] = [];
  mostrarModalAgregar: boolean = false;

  


  constructor(
    private apiRequestService: ApiRequestService,
    private fb: FormBuilder,
    ) 
  {
    this.formularioEmpleado = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      departamento: ['', Validators.required],
      sucursal: ['', Validators.required],
      rol: ['', Validators.required],
      telefonoMovil: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerNombreCategoria();
    this.getLoggedUser();
    this.obtenerSucursales();
    this.obtenerReportes()
    this.obtenerDepartamento()
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
      const roleId = response.role_id;
     
      
      if (roleId === 1) {
        this.employeeRole = 'admin';
      } else if (roleId === 2){
        this.employeeRole = 'manager';
      }
    },
    error => {
      console.error('Error when obtaining data from the logged in user:', error);
    }
  );
}

mostrarNotificacion(mensaje: string, duracion: number = 4000) {
  this.envioExitoso = true;
  this.mensajeNotificacion = mensaje;
  setTimeout(() => {
    this.envioExitoso = false;
    this.mensajeNotificacion = '';
  }, duracion);
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
          this.resetForm();
          this.mostrarNotificacion('El reporte se ha enviado correctamente', 4000);
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
  const datos = ['Nombre: ', 'Apellido: ', 'Email: ', 'Teléfono Móvil: ', 'Departamento: ', 'Sucursal:', 'Rol:'];
  this.petition = datos.join('\n');
}

onCategoriaChange() {
  this.petition = this.formatSelectedCategories();
}

formatSelectedCategories() {
  if (this.solicitudMaterial) {
    const selectedCategories = this.getCategoriasSeleccionadas();
    let formattedCategories = selectedCategories.map(c => c.name + ': '); // Agregar ":" después de cada nombre de categoría
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

obtenerReportes() {
  this.apiRequestService.listReportes().subscribe(
    (response: any[]) => {
      this.reportes = response.filter(reporte => reporte.state === 'pending')
      .map(reporte => ({
        id: reporte.id,
        solicitud: reporte.petition,
        prioridad: reporte.priority,
        estado: reporte.state,
        type: reporte.type,
        nameempleado: reporte.employee_name,        
        sucursalid: reporte.employee_id_sucursal,  
      }));
    },
    error => {
      console.error('Error al obtener reportes:', error);
    }
  );
}

obtenerNombreSucursal(sucursalId: number): string {
  const sucursal = this.sucursales.find(sucursal => sucursal.id === sucursalId);
  return sucursal ? sucursal.name : ''; // Devuelve el nombre de la sucursal si se encuentra, de lo contrario devuelve una cadena vacía
}

obtenerSucursales() {
  this.apiRequestService.listBranchOffices().subscribe(
    (response: any[]) => {
      this.sucursales = response;
    },
    error => {
      console.error('Error al obtener sucursales:', error);
    }
  );
}

obtenerDepartamento() {
  this.apiRequestService.listDepartments().subscribe(
    (response: any[]) => {
      this.departamentos = response;
    },
    error => {
      console.error('Error al obtener department:', error);
    }
  );
}

mostrarDetalle(reporte: any) {
  this.reporteSeleccionado = reporte;
}

cerrarModal() {
  this.reporteSeleccionado = null;
  this.obtenerReportes();
  this.cerrarModal_Agregar()
}

cambiarEstadoReporte(idReporte: number, estado: string, event: any) {
  if (event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      const isChecked = target.checked;

      // Obtener una referencia a ambos checkboxes
      const aceptarCheckbox = document.getElementById('aceptar') as HTMLInputElement;
      const rechazarCheckbox = document.getElementById('rechazar') as HTMLInputElement;

      // Desmarcar el otro checkbox si el checkbox actual se selecciona
      if (isChecked) {
        if (target === aceptarCheckbox) {
          rechazarCheckbox.checked = false;
        } else if (target === rechazarCheckbox) {
          aceptarCheckbox.checked = false;
        }
      }

      const nuevoEstado = isChecked ? (estado === 'aceptado' ? 'accepted' : 'denied') : '';

      // Llamar al servicio API para cambiar el estado del reporte
      this.apiRequestService.cambiarEstadoReporte(idReporte, nuevoEstado).subscribe(
        (response: any) => {
          console.log('Estado del reporte cambiado:', response);
          // Manejar la respuesta del servicio si es necesario
        },
        (error: any) => {
          console.error('Error al cambiar el estado del reporte:', error);
          // Manejar el error del servicio si es necesario
        }
      );

      console.log('ID del reporte:', idReporte);
      console.log('Nuevo estado:', nuevoEstado);
    }
  }
}

agregarEmpleado() {
  if (this.formularioEmpleado.valid) {
    const nuevoEmpleado = this.formularioEmpleado.value;
    this.apiRequestService.addEmployee(nuevoEmpleado).subscribe(
      (response: any) => {
        this.cerrarModal_Agregar();

      },
      (error: any) => {
        console.error('Error al agregar empleado:', error);
      }
    );
  } else {
    console.error('Formulario inválido. Por favor, complete todos los campos requeridos.');
  }
}

mostrarModal() {
  this.mostrarModalAgregar = true;
}

cerrarModal_Agregar() {
  this.mostrarModalAgregar = false;
  this.formularioEmpleado.reset();
}
}