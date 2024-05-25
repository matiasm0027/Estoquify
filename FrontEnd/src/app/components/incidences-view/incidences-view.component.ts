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

  // Load options asynchronously
cargarOpciones() {
  // Combine multiple observables into one observable
  forkJoin([
    this.authControlService.cargarSucursales(), // Load branches
    this.authControlService.cargarDepartamentos(), // Load departments
    this.authControlService.cargarRoles(), // Load roles
  ]).subscribe(
    // Handle successful completion
    ([sucursales, departamentos, roles]) => {
      // Assign loaded data to respective variables
      this.sucursales = sucursales; // Branches
      this.departamentos = departamentos; // Departments
      this.roles = roles; // Roles
    },
    // Handle errors
    (error) => {
      // Log error to console
      console.error('Error loading options', error);
    }
  );
}


  //-------------------------------------------------------------FUNCTIONS ROLE MANAGER--------------------------------------------------------------------

  toggleCheckbox(selectedCheckbox: string) {
    // Reset petition variable
    this.petition = '';
  
    // Check which checkbox is selected and perform corresponding actions
    if (selectedCheckbox === 'altaEmpleado' && this.altaEmpleado) {
      // If 'altaEmpleado' checkbox is selected and already checked
      // Deselect other checkboxes and call function to handle 'altaEmpleado'
      this.solicitudMaterial = false;
      this.bajaEmpleado = false;
      this.bajaMaterial = false;
      this.onAltaEmpleado();
    } else if (selectedCheckbox === 'solicitudMaterial' && this.solicitudMaterial) {
      // If 'solicitudMaterial' checkbox is selected and already checked
      // Deselect other checkboxes and call function to handle 'solicitudMaterial'
      this.altaEmpleado = false;
      this.bajaEmpleado = false;
      this.bajaMaterial = false;
      this.onCategoriaChange();
    } else if (selectedCheckbox === 'bajaEmpleado') {
      // If 'bajaEmpleado' checkbox is selected
      // Deselect other checkboxes and call function to handle 'bajaEmpleado'
      this.solicitudMaterial = false;
      this.altaEmpleado = false;
      this.bajaMaterial = false;
      this.onBajaEmpleado();
    } else if (selectedCheckbox === 'bajaMaterial') {
      // If 'bajaMaterial' checkbox is selected
      // Deselect other checkboxes and call function to handle 'bajaMaterial'
      this.solicitudMaterial = false;
      this.altaEmpleado = false;
      this.bajaEmpleado = false;
      this.onBajaMaterial();
    }
  }

  // Toggle priority options based on the selected priority
togglePriority(selectedPriority: string) {
  // Check which priority option is selected and perform corresponding actions
  if (selectedPriority === 'prioridadLow' && this.prioridadLow) {
    // If 'prioridadLow' is selected and already checked
    // Deselect other priority options
    this.prioridadMedium = false;
    this.prioridadHigh = false;
  } else if (selectedPriority === 'prioridadMedium' && this.prioridadMedium) {
    // If 'prioridadMedium' is selected and already checked
    // Deselect other priority options
    this.prioridadLow = false;
    this.prioridadHigh = false;
  } else if (selectedPriority === 'prioridadHigh' && this.prioridadHigh) {
    // If 'prioridadHigh' is selected and already checked
    // Deselect other priority options
    this.prioridadLow = false;
    this.prioridadMedium = false;
  }
}


// Add a new incidence report
addIncidence(): void {
  // Get current date in ISO string format
  const date = new Date().toISOString().slice(0, 10);
  let type: string = '';

  // Determine the type based on user selection
  if (this.altaEmpleado) {
    type = 'Alta Empleado';
  } else if (this.solicitudMaterial) {
    type = 'Solicitud Material';
  } else if (this.bajaEmpleado) {
    type = 'Baja Empleado';
  } else if (this.bajaMaterial) {
    type = 'Baja Material';
  }

  // Validate that a valid type of incidence has been selected
  if (!type) {
    console.error('Error: No valid incidence type selected');
    return;
  }

  // Validate that petition is defined and has a value
  if (!this.petition || this.petition.trim() === '') {
    console.error('Error: Petition cannot be empty');
    return;
  }

  // Validate that employeeId is defined
  if (!this.loggedInUser?.id) {
    console.error('Error: Unable to read employee data');
    return;
  }

  try {
    // Build the incidence object
    let newIncidence = new Incidence(
      0, // id, expected to be assigned by the database
      date,
      this.petition,
      'pending',
      this.getPriority(),
      type,
      this.loggedInUser?.id
    );

    // Add selected categories only if the type is 'Solicitud Material'
    if (type === 'Solicitud Material') {
      newIncidence.categories = this.getCategoriasSeleccionadas().map(id => new Category(id.id,id.name));
    }

    // Call the API service to add the report
    this.ApiRequestService.addIncidence(newIncidence).subscribe(
      // Handle successful response
      (response: any) => {
        // Reset form fields and show notification
        this.resetForm();
        this.mostrarNotificacion('The report has been submitted successfully', 4000);
      },
      // Handle errors
      (error: any) => {
        console.error('Error adding report:', error);
        // Handle error if necessary
      }
    );
  } catch (error) {
    console.error("Error adding report:", error);
    // Handle error according to your needs, e.g., display a message to the user
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
