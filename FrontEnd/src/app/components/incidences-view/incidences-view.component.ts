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
    // Get the role of the user from the authentication control service
    this.userRole = this.authControlService.hasRole();

    // Get the logged-in user from the authentication control service
    this.authControlService.getLoggedUser().subscribe(
        (user) => {
            // Store the logged-in user
            this.loggedInUser = user;
        }
    );

    // Load options for branch offices
    this.cargarOpciones();

    // Fetch category names
    this.obtenerNombreCategoria();

    // Fetch reports
    this.obtenerReportes();
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
    // Initialize an empty array to store the selected category IDs
    const categoriasSeleccionadasIds: number[] = [];
    
    // Iterate over the keys (category IDs) in the categoriasSeleccionadas object
    for (const categoriaId in this.categoriasSeleccionadas) {
        // Check if the current category ID is marked as selected
        if (this.categoriasSeleccionadas[categoriaId]) {
            // Convert the string category ID to an integer and add it to the array
            categoriasSeleccionadasIds.push(parseInt(categoriaId));
        }
    }
    
    // Return the array of selected category IDs
    return categoriasSeleccionadasIds;
}

getCategoriasSeleccionadas(): { id: number, name: string }[] {
  // Initialize an empty array to store the selected categories
  const categoriasSeleccionadas: { id: number, name: string }[] = [];
  
  // Iterate over the keys (category IDs) in the categoriasSeleccionadas object
  for (const categoriaId in this.categoriasSeleccionadas) {
      // Check if the current category ID is marked as selected
      if (this.categoriasSeleccionadas[categoriaId]) {
          // Find the category object that matches the current category ID
          const categoria = this.categories.find(cat => cat.id === parseInt(categoriaId));
          
          // If a matching category object is found, add it to the array with its ID and name
          if (categoria) {
              categoriasSeleccionadas.push({ id: parseInt(categoriaId), name: categoria.name });
          }
      }
  }
  
  // Return the array of selected categories with their IDs and names
  return categoriasSeleccionadas;
}

onBajaEmpleado() {
  // Check if the "bajaEmpleado" flag is set
  if (this.bajaEmpleado) {
      // Append "Empleado: " to the petition string if Baja Empleado is selected
      this.petition += 'Empleado: ';
  }
}

onBajaMaterial() {
  // Check if the "bajaMaterial" flag is set
  if (this.bajaMaterial) {
      // Append "Material: " to the petition string if Baja Material is selected
      this.petition += 'Material: ';
  }
}

onAltaEmpleado() {
  // Define an array of strings representing the data fields for an employee
  const datos = ['Nombre: ', 'Apellido: ', 'Email: ', 'Teléfono Móvil: ', 'Departamento: ', 'Sucursal:', 'Rol:'];
  
  // Join the elements of the array into a single string with each element on a new line
  this.petition = datos.join('\n');
}

onCategoriaChange() {
  // Set the petition string to the formatted list of selected categories
  this.petition = this.formatSelectedCategories();
}
formatSelectedCategories() {
  // Check if the "solicitudMaterial" flag is set
  if (this.solicitudMaterial) {
      // Get the list of selected categories
      const selectedCategories = this.getCategoriasSeleccionadas();
      
      // Map each category to a string with the category name followed by ":"
      let formattedCategories = selectedCategories.map(c => c.name + ': ');
      
      // Join the formatted category strings with newline characters
      return formattedCategories.join('\n');
  } else {
      // If "solicitudMaterial" is not set, return an empty string
      return '';
  }
}


resetForm() {
  // Reset the values of the form fields
  this.petition = ''; // Clear the petition string
  this.altaEmpleado = false; // Uncheck the "altaEmpleado" flag
  this.solicitudMaterial = false; // Uncheck the "solicitudMaterial" flag
  this.prioridadLow = false; // Uncheck the "prioridadLow" flag
  this.prioridadMedium = false; // Uncheck the "prioridadMedium" flag
  this.prioridadHigh = false; // Uncheck the "prioridadHigh" flag
  this.categoriasSeleccionadas = {}; // Clear the selected categories
}

  //-------------------------------------------------FUNCTIONS ROLE ADMIN ----------------------------------------------------------------------------

  asignarMaterial() {
    // Get the value of fullname (the ID of the employee)
    const employeeId = this.formularioMaterial.value.fullname.id;

    // Check if an employee has been selected (if fullname has a value)
    if (!employeeId) {
        console.error('No employee has been selected.');
        return; // Do nothing further if no employee has been selected
    }

    // Iterate over the categories and call the API if they have a selected value
    for (let i = 1; i <= 6; i++) {
        const categoriaValue = this.formularioMaterial.value['categoria' + i];
        if (categoriaValue) {
            // Logic to assign the material to the employee with the provided ID
            const materialId = categoriaValue;
            // Call the service to assign the material to the employee
            this.ApiRequestService.asignarMaterial(materialId, employeeId).subscribe(
                (response) => {
                    // Handle successful assignment
                    this.successMessage = response.message;
                    // Reset the form after successful assignment
                    this.formularioMaterial.reset();
                    // Close the material assignment modal
                    this.cerrarModal_Material();
                },
                (error) => {
                    // Handle errors during assignment
                    console.error('Error assigning material:', error);
                }
            );
        }
    }
}

obtenerNombreCategoria() {
  // Call the API to get the category material
  this.ApiRequestService.categoryMaterial().subscribe(
      (response: any[]) => {
          // Map the response to an array of categories with id and name
          this.categories = response.map(material => ({
              id: material.id,
              name: material.name, // Change to category_name if needed
          }));

          // Iterate over each category to get additional details
          this.categories.forEach(categoria => {
              this.getCategoriaDetails(categoria.id);
          });

          // Set cargaDatos to false after the data has been loaded
          this.cargaDatos = false;
      }
  );
}

mostrarNotificacion(mensaje: string, duracion: number = 4000) {
  // Set envioExitoso to true to indicate that the notification should be shown
  this.envioExitoso = true;
  // Set the notification message
  this.mensajeNotificacion = mensaje;
  // Set a timeout to hide the notification after the specified duration
  setTimeout(() => {
      this.envioExitoso = false;
      this.mensajeNotificacion = '';
  }, duracion);
}

obtenerReportes() {
  // Call the API to get the list of incidences
  this.ApiRequestService.listIncidences().subscribe(
      (response: Incidence[]) => {
          // Store the response in the incidences array
          this.incidences = response;
          // Filter the incidences to get only those that are pending
          this.incidencesPending = response.filter((incidence: Incidence) => incidence.state === 'pending');
          // Set cargaDatos to false after the data has been loaded
          this.cargaDatos = false;
      },
      error => {
          // Log any errors that occur while fetching the reports
          console.error('Error al obtener reportes:', error);
      }
  );
}

mostrarDetalle(incidence: Incidence) {
  // Set the selected incidence to show its details
  this.incidenceSelect = incidence;
}

cerrarModal() {
  // Clear the selected incidence to close the details modal
  this.incidenceSelect = null;
  // Refresh the list of reports
  this.obtenerReportes();
  // Close the modal for adding a new report
  this.cerrarModal_Agregar();
}


cambiarEstadoReporte(idReporte: number, estado: string, event: any) {
  if (event) {
      const target = event.target as HTMLInputElement;
      if (target) {
          const isChecked = target.checked;

          // Get references to both checkboxes
          const aceptarCheckbox = document.getElementById('aceptar') as HTMLInputElement;
          const rechazarCheckbox = document.getElementById('rechazar') as HTMLInputElement;

          // Uncheck the other checkbox if the current checkbox is selected
          if (isChecked) {
              if (target === aceptarCheckbox) {
                  rechazarCheckbox.checked = false;
              } else if (target === rechazarCheckbox) {
                  aceptarCheckbox.checked = false;
              }
          }

          // Determine the new state based on whether the checkbox is checked and the current state
          const nuevoEstado = isChecked ? (estado === 'aceptado' ? 'accepted' : 'rejected') : '';

          // Call the API service to change the state of the report
          this.ApiRequestService.cambiarEstadoIncidencia(idReporte, nuevoEstado).subscribe(
              (response: any) => {
                  // Handle the response from the service if necessary
              },
              (error: any) => {
                  // Log any errors that occur while changing the report state
                  console.error('Error al cambiar el estado del reporte:', error);
                  // Handle the service error if necessary
              }
          );
      }
  }
}


agregarEmpleado(): void {
  // Reset error and success messages
  this.errorMessage2 = "";
  this.successMessage = "";

  // Check if the employee form is valid
  if (this.formularioEmpleado.valid) {
      // Extract data from the form
      const nuevoEmpleado: Employee = this.formularioEmpleado.value;
      try {
          // Call the API service to add the new employee
          this.ApiRequestService.addEmployee(nuevoEmpleado).subscribe(
              (response: any) => {
                  // Handle successful addition of employee
                  this.successMessage = response.message;
                  // Close the add employee modal
                  this.cerrarModal_Agregar();
              },
              (error: any) => {
                  // Handle errors from the API service
                  this.errorMessage2 = error.error.error;
                  // No further action is taken in case of error
              }
          );
      } catch (error) {
          // Handle any exceptions that occur
          this.errorMessage2 = 'Error al agregar empleado:', error;
          // No further action is taken in case of error
      }
  } else {
      // Display error message if the employee form is invalid
      this.errorMessage2 = 'Formulario inválido. Por favor, complete todos los campos requeridos.';
  }
}

mostrarModal() {
  // Show the add employee modal
  this.mostrarModalAgregar = true;
}

cerrarModal_Agregar() {
  // Close the add employee modal and reset the form
  this.mostrarModalAgregar = false;
  this.formularioEmpleado.reset();
}

mostrarModal_Material() {
  // Show the material modal
  this.mostrarModalMaterial = true;

  // Fetch category names
  this.obtenerNombreCategoria();

  // Fetch employee details
  this.obtenerEmpleados();

  // Set placeholder for employee selection
  this.placeholder = "Seleccionar empleado";

  // Reset selected employee
  this.selectedEmployee = undefined;
}

cerrarModal_Material() {
  // Close the material modal and reset the material form
  this.mostrarModalMaterial = false;
  this.formularioMaterial.reset();

  // Reset selected employee
  this.selectedEmployee = undefined;
}


getCategoriaDetails(idCategoria: number): void {
  // Fetch details of the category material
  this.ApiRequestService.categoryMaterialInfo(idCategoria).subscribe(
      (categoria: any) => {
          // Check if attributeCategoryMaterials exists and is an object
          if (categoria.attributeCategoryMaterials) {
              // Collect all available materials
              const materialesDisponibles = Object.values(categoria.attributeCategoryMaterials)
                  .flatMap((attrCatMat: any) => attrCatMat.material)
                  .filter((material: any) => material.state === 'available' && material.branch_office?.id === this.incidenceSelect?.employee?.branch_office?.id);

              // Check if the material already exists in detallesMaterial before adding it
              for (const material of materialesDisponibles) {
                  const existeMaterial = this.detallesMaterial[idCategoria]?.some((m: any) => m.id === material.id);
                  if (!existeMaterial) {
                      this.detallesMaterial[idCategoria] = [...(this.detallesMaterial[idCategoria] || []), material];
                  }
              }
          }
      },
      (error: any) => {
          // Log any errors that occur while fetching category details
          console.error('Error al obtener los detalles de la categoría:', error);
      }
  );
}

onChangeCategoria(idCategoria: number): void {
  // Call the function to fetch details of the selected category
  this.getCategoriaDetails(idCategoria);
}

obtenerNombreSucursal(sucursalId: number): string {
  // Find the branch office with the given ID
  const sucursal = this.sucursales.find(sucursal => sucursal.id === sucursalId);
  // Return the name of the branch office if found, otherwise return an empty string
  return sucursal ? sucursal.name : '';
}


obtenerEmpleados() {
  // Fetch the list of employees from the API
  this.ApiRequestService.getEmployees().subscribe(
      (data: Employee[]) => {
          // Get the name of the branch office from the selected incidence
          const sucursalNombre = this.incidenceSelect?.employee?.branch_office?.name;

          // Filter employees by branch office name
          this.employees = data.filter(employee => employee.branch_office?.name === sucursalNombre);

          // Initialize filteredEmployees with the filtered list of employees
          this.filteredEmployees = this.employees;

          // Transform fullname by combining name and last_name
          this.filteredEmployees.forEach(employee => {
              employee.fullname = employee.name + ' ' + employee.last_name;
          });
      },
      error => {
          // Log any errors that occur while fetching employees
          console.error('Error al obtener empleados:', error);
      }
  );
}

buscarEmpleado(event: { term: string; items: any[]; }) {
  // Clear the selected employee and reset the placeholder
  this.selectedEmployee = undefined;
  const searchTerm = event.term.toLowerCase();
  this.placeholder = "Seleccionar empleado";

  // If there is a search term, filter the list of employees; otherwise, show all employees
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
  // Set the selected employee and reset the placeholder
  this.selectedEmployee = employee;
  this.placeholder = '';
  // Reset the filtered list of employees
  this.filteredEmployees = this.employees;
}


}
