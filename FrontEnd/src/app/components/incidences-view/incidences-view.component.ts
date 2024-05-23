import { Incidence } from './../../model/Incidence';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Category } from 'src/app/model/Category';
import { Employee } from 'src/app/model/Employee';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-incidences-view',
  templateUrl: './incidences-view.component.html',
  styleUrls: ['./incidences-view.component.css']
})
export class IncidenceViewComponent implements OnInit {
  categories: any[] = [];
  altaEmpleado: boolean = false;
  solicitudMaterial: boolean = false;
  bajaEmpleado: boolean = false;
  bajaMaterial: boolean = false;
  categoriasSeleccionadas: { [key: string]: boolean } = {};
  prioridadLow: boolean = false;
  prioridadMedium: boolean = false;
  prioridadHigh: boolean = false;
  employeeId!: number;
  petition: string = '';
  envioExitoso: boolean = false;
  mensajeNotificacion: string = '';
  formularioEmpleado: FormGroup;
  mostrarModalAgregar: boolean = false;
  mostrarModalMaterial: boolean = false;
  detallesMaterial: { [key: number]: any[] } = {};
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedEmployee: Employee | undefined;
  placeholder: string = "Seleccionar empleado";
  formularioMaterial: FormGroup;
  successMessage!: string;
  errorMessage2!:string;
  cargaDatos: boolean = true;

  userRole!: any;
  loggedInUser!: Employee | null;
  departamentos: { id: number; name: string; }[] = [];
  sucursales: { id: number; name: string; }[] = [];
  roles: { id: number; name: string; }[] = [];

  incidences!: Incidence[];
  incidencesPending!: Incidence[];
  incidenceSelect!:Incidence | null;
  constructor(
    private ApiRequestService: ApiRequestService,
    private authControlService: UsuariosControlService,
    private fb: FormBuilder,
  ) {
    this.formularioEmpleado = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+$')]],
      last_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),]],
      password: ['', Validators.required],
      department_id: ['', Validators.required],
      branch_office_id: ['', Validators.required],
      role_id: ['', Validators.required],
      phone_number: ['', [Validators.required, Validators.pattern('(6|7)[ -]*([0-9][ -]*){8}')]],
    });
    this.formularioMaterial = this.fb.group({
      fullname: [, Validators.required],
      categoria1: [''],
      categoria2: [''],
      categoria3: [''],
      categoria4: [''],
      categoria5: [''],
      categoria6: [''],
    });
  }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(
      (user) => {
        this.loggedInUser = user;
      }
    );
    this.cargarOpciones();
    this.obtenerNombreCategoria();
    this.obtenerReportes()

  }

  cargarOpciones() {
    forkJoin([
      this.authControlService.cargarSucursales(),
      this.authControlService.cargarDepartamentos(),
      this.authControlService.cargarRoles(),
    ]).subscribe(
      ([sucursales, departamentos, roles]) => {
        this.sucursales = sucursales;
        this.departamentos = departamentos;
        this.roles = roles;
      },
      (error) => {
        console.error('Error loading options', error);
      }
    );
  }


  //-------------------------------------------------------------FUNCIONES DE ROL MANAGER--------------------------------------------------------------------

  toggleCheckbox(selectedCheckbox: string) {
    this.petition = '';
    if (selectedCheckbox === 'altaEmpleado' && this.altaEmpleado) {
      this.solicitudMaterial = false; // Deselecciona Solicitud Material si se selecciona Alta Empleado
      this.bajaEmpleado = false;
      this.bajaMaterial = false;
      this.onAltaEmpleado();
    } else if (selectedCheckbox === 'solicitudMaterial' && this.solicitudMaterial) {
      this.altaEmpleado = false; // Deselecciona Alta Empleado si se selecciona Solicitud Material
      this.bajaEmpleado = false;
      this.bajaMaterial = false;
      this.onCategoriaChange();
    } else if (selectedCheckbox === 'bajaEmpleado') {
      this.solicitudMaterial = false;
      this.altaEmpleado = false;
      this.bajaMaterial = false;
      this.onBajaEmpleado(); // Llama a la función para manejar Baja Empleado
    } else if (selectedCheckbox === 'bajaMaterial') {
      this.solicitudMaterial = false;
      this.altaEmpleado = false;
      this.bajaEmpleado = false;
      this.onBajaMaterial(); // Llama a la función para manejar Baja Material
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

  addIncidence(): void {
    const date = new Date().toISOString().slice(0, 10);
    let type: string = '';
  
    // Determinar el tipo según la selección del usuario
    if (this.altaEmpleado) {
      type = 'Alta Empleado';
    } else if (this.solicitudMaterial) {
      type = 'Solicitud Material';
    } else if (this.bajaEmpleado) {
      type = 'Baja Empleado';
    } else if (this.bajaMaterial) {
      type = 'Baja Material';
    }
  
    // Validar que se haya seleccionado un tipo válido
    if (!type) {
      console.error('Error: No se ha seleccionado un tipo válido de incidencia');
      return;
    }
  
    // Validar que petition esté definida y tenga un valor
    if (!this.petition || this.petition.trim() === '') {
      console.error('Error: La petición no puede estar vacía');
      return;
    }
  
    // Validar que employeeId esté definido
    if (!this.loggedInUser?.id) {
      console.error('Error: No se puedo leer datos del empleado');
      return;
    }
  
    try {
      // Construir el objeto de incidencia
      let newIncidence = new Incidence(
        0, // id, se espera que sea asignado por la base de datos
        date,
        this.petition,
        'pending',
        this.getPriority(),
        type,
        this.loggedInUser?.id
      );
  
      // Agregar categorías seleccionadas solo si el tipo es 'Solicitud Material'
      if (type === 'Solicitud Material') {
        newIncidence.categories = this.getCategoriasSeleccionadas().map(id => new Category(id.id,id.name));
      }
  
      // Llamar al servicio API para agregar el reporte
      this.ApiRequestService.addIncidence(newIncidence).subscribe(
        (response: any) => {
          this.resetForm();
          this.mostrarNotificacion('El reporte se ha enviado correctamente', 4000);
        },
        (error: any) => {
          console.error('Error al agregar el reporte:', error);
          // Manejar el error si es necesario
        }
      );
    } catch (error) {
      console.error("Error al agregar el reporte:", error);
      // Manejar el error de acuerdo a tus necesidades, por ejemplo, mostrar un mensaje al usuario
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

  onBajaEmpleado() {
    if (this.bajaEmpleado) {
      this.petition += 'Empleado: '; // Agrega "Empleado: " a la petición si se selecciona Baja Empleado
    }
  }

  onBajaMaterial() {
    if (this.bajaMaterial) {
      this.petition += 'Material: '; // Agrega "Material: " a la petición si se selecciona Baja Material
    }
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

  //-------------------------------------------------FUNCIONES ROL ADMIN ----------------------------------------------------------------------------

  asignarMaterial() {
    // Obtiene el valor de fullname (el ID del empleado)
    const employeeId = this.formularioMaterial.value.fullname.id;

    // Verifica si se ha seleccionado un empleado (si fullname tiene un valor)
    if (!employeeId) {
      console.error('No se ha seleccionado un empleado.');
      return; // No hace nada más si no se ha seleccionado un empleado
    }

    // Itera sobre las categorías y llama a la API si tienen un valor seleccionado
    for (let i = 1; i <= 6; i++) {
      const categoriaValue = this.formularioMaterial.value['categoria' + i];
      if (categoriaValue) {
        // Lógica para asignar el material al empleado con el ID proporcionado
        const materialId = categoriaValue;
        // Llama al servicio para asignar el material al empleado
        this.ApiRequestService.asignarMaterial(materialId, employeeId).subscribe(
          (response) => {
            this.successMessage = response.message;
            this.formularioMaterial.reset();
            this.cerrarModal_Material()
          },
          (error) => {
            console.error('Error al asignar el material:', error);
          }
        );
      }
    }
  }

  obtenerNombreCategoria() {
    this.ApiRequestService.categoryMaterial().subscribe(
      (response: any[]) => {
        this.categories = response.map(material => ({
          id: material.id,
          name: material.name, // Cambiar a category_name
        }));

        this.categories.forEach(categoria => {
          this.getCategoriaDetails(categoria.id);
        });
        this.cargaDatos = false;

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

  obtenerReportes() {
    this.ApiRequestService.listIncidences().subscribe(
      (response:Incidence[]) => {
        this.incidences = response;
        this.incidencesPending = response.filter((incidence:Incidence) => incidence.state === 'pending');
        this.cargaDatos = false;
      },
      error => {
        console.error('Error al obtener reportes:', error);
      }
    );
  }

  mostrarDetalle(incidence:Incidence) {
    this.incidenceSelect = incidence;
  }

  cerrarModal() {
    this.incidenceSelect = null;
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

        const nuevoEstado = isChecked ? (estado === 'aceptado' ? 'accepted' : 'rejected') : '';

        // Llamar al servicio API para cambiar el estado del reporte
        this.ApiRequestService.cambiarEstadoIncidencia(idReporte, nuevoEstado).subscribe(
          (response: any) => {

          },
          (error: any) => {
            console.error('Error al cambiar el estado del reporte:', error);
            // Manejar el error del servicio si es necesario
          }
        );

        
      }
    }
  }

  agregarEmpleado(): void {
    this.errorMessage2 = "";
    this.successMessage = "";
    if (this.formularioEmpleado.valid) {
      const nuevoEmpleado: Employee = this.formularioEmpleado.value;
      try {
        this.ApiRequestService.addEmployee(nuevoEmpleado).subscribe(
          (response: any) => {
            this.successMessage = response.message;
            this.cerrarModal_Agregar();
          },
          (error: any) => {
            this.errorMessage2 = error.error.error;
            // No realizar ninguna acción adicional en caso de error
          }
        );
      } catch (error) {
        this.errorMessage2 = 'Error al agregar empleado:', error;
        // No realizar ninguna acción adicional en caso de error
      }
    } else {
      this.errorMessage2 = 'Formulario inválido. Por favor, complete todos los campos requeridos.';
    }
}

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  cerrarModal_Agregar() {
    this.mostrarModalAgregar = false;
    this.formularioEmpleado.reset();
  }

  mostrarModal_Material() {
    this.mostrarModalMaterial = true;
    this.obtenerNombreCategoria()
    this.obtenerEmpleados()
    this.placeholder = "Seleccionar empleado";
    this.selectedEmployee = undefined;
  }

  cerrarModal_Material() {
    this.mostrarModalMaterial = false;
    this.formularioMaterial.reset();
    this.selectedEmployee = undefined;
  }

  getCategoriaDetails(idCategoria: number): void {
    this.ApiRequestService.categoryMaterialInfo(idCategoria).subscribe(
      (categoria: any) => {
        // Verifica que attributeCategoryMaterials existe y es un objeto
        if (categoria.attributeCategoryMaterials) {
          // Recoge todos los materiales disponibles
          const materialesDisponibles = Object.values(categoria.attributeCategoryMaterials)
            .flatMap((attrCatMat: any) => attrCatMat.material)
            .filter((material: any) => material.state === 'available' && material.branch_office?.id === this.incidenceSelect?.employee?.branch_office?.id);

          // Verifica si el material ya existe en detallesMaterial antes de agregarlo
          for (const material of materialesDisponibles) {
            const existeMaterial = this.detallesMaterial[idCategoria]?.some((m: any) => m.id === material.id);
            if (!existeMaterial) {
              this.detallesMaterial[idCategoria] = [...(this.detallesMaterial[idCategoria] || []), material];
            }
          }
        }
      },
      (error: any) => {
        console.error('Error al obtener los detalles de la categoría:', error);
      }
    );
  }

  onChangeCategoria(idCategoria: number): void {
    this.getCategoriaDetails(idCategoria);
  }

  obtenerNombreSucursal(sucursalId: number): string {
    const sucursal = this.sucursales.find(sucursal => sucursal.id === sucursalId);
    return sucursal ? sucursal.name : ''; // Devuelve el nombre de la sucursal si se encuentra, de lo contrario devuelve una cadena vacía
  }

  obtenerEmpleados() {
    this.ApiRequestService.getEmployees().subscribe(
      (data: Employee[]) => {
        const sucursalNombre = this.incidenceSelect?.employee?.branch_office?.name;

        // Filtrar empleados por nombre de sucursal
        this.employees = data.filter(employee => employee.branch_office?.name === sucursalNombre);

        // Filtrar filteredEmployees por nombre de sucursal
        this.filteredEmployees = this.employees;

        // Transformar fullname
        this.filteredEmployees.forEach(employee => {
          employee.fullname = employee.name + ' ' + employee.last_name;
        });

      },
      error => {
        console.error('Error al obtener empleados:', error);
      }
    );
  }

  buscarEmpleado(event: { term: string; items: any[]; }) {
    this.selectedEmployee = undefined;
    const searchTerm = event.term.toLowerCase();
    this.placeholder = "Seleccionar empleado";
    // Si hay un término de búsqueda, filtrar la lista de empleados, de lo contrario, mostrar todos los empleados
    if (searchTerm.trim() !== '') {
      this.filteredEmployees = this.employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.last_name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredEmployees = this.employees;
    }
}

  seleccionarEmpleado(employee: Employee) {
    this.selectedEmployee = employee;
    this.placeholder = '';
    this.filteredEmployees = this.employees;
  }

}
