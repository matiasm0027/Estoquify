import { Component, OnInit } from '@angular/core';
import { Category } from 'src/app/model/Category';
import { Employee } from 'src/app/model/Employee';
import { Incidence } from 'src/app/model/Incidence';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

interface MaterialState {
  available: number;
  active: number;
  inactive: number;
  total: number;
}

interface SucursalTotals {
  [category: string]: MaterialState;
}

interface Totales {
  [sucursal: string]: SucursalTotals;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loggedInUser!: Employee | null;  // Inicializar con un valor nulo
  employeeRole!: string;
  employee!: any;
  materials: any[] = [];
  cargaDatos: boolean = true;
  userRole!: any;
  incidencesPending!: Incidence[];
  incidencesSend!: Incidence[];
  totales: Totales = {};
  categories: Category[] = [];
  empleadosPorSucursal: any[] = []; // Inicializa como un array vacío en lugar de un objeto vacío
  sumaCat: any[] = [];
  sucursales: { id: number; name: string; }[] = [];
  categoriasConPocosMateriales!: any;
  sucursalName: string = "";
  constructor(private ApiRequestService: ApiRequestService, private authControlService: UsuariosControlService) { }

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

    // Fetch reports
    this.obtenerReportes();

    // Fetch material quantities
    this.obtenerCantidadMaterial();

    // Fetch reports for the logged-in employee
    this.obtenerReportesDelEmpleado();

    // Fetch employee quantities per branch office
    this.obtenerCantidadEmpleadosPorSucursal();
  }


  cargarOpciones() {
    // Load options for branch offices from the authentication control service
    this.authControlService.cargarSucursales().subscribe(
      (sucursales) => {
        // Store the loaded branch offices in the sucursales array
        this.sucursales = sucursales;
      },
      (error) => {
        // Log any errors that occur while loading options
        console.error('Error loading options', error);
      }
    );
  }

  obtenerCantidadMaterial() {
    // Fetch category material from the API
    this.ApiRequestService.categoryMaterial().subscribe(category => {
      // Store the fetched category material
      this.categories = category;
      // Calculate totals based on the fetched data
      this.calcularTotales();
    });
  }


  calcularTotales(): void {
    // Initialize totals object

    // Initialize totals object
    this.totales = {};

    // Iterate through each category
    this.categories.forEach(categoria => {

      // Check if the category has attributeCategoryMaterials and it's an object
      if (categoria.attributeCategoryMaterials && typeof categoria.attributeCategoryMaterials === 'object') {
        // Iterate through each material object within the category
        Object.values(categoria.attributeCategoryMaterials).forEach((materialObj: any) => {
          // Get the branch office name and material state
          this.sucursalName = materialObj.material?.branch_office?.name;
          const materialState = materialObj.material?.state;

          // Check if both branch office name and material state are defined
          if (this.sucursalName && materialState) {
            // Initialize totals for the branch office if not already initialized
            if (!this.totales[this.sucursalName]) {
              this.totales[this.sucursalName] = {};
            }

            // Initialize totals for the category if not already initialized
            if (!this.totales[this.sucursalName][categoria.name]) {
              this.totales[this.sucursalName][categoria.name] = {
                available: 0,
                active: 0,
                inactive: 0,
                total: 0
              };
            }

            // Increment the corresponding state count based on the material state
            if (materialState === 'available') {
              this.totales[this.sucursalName][categoria.name].available++;
            } else if (materialState === 'active') {
              this.totales[this.sucursalName][categoria.name].active++;
            } else if (materialState === 'inactive') {
              this.totales[this.sucursalName][categoria.name].inactive++;
            }

            // Calculate the total count for the category
            this.totales[this.sucursalName][categoria.name].total =
              this.totales[this.sucursalName][categoria.name].available +
              this.totales[this.sucursalName][categoria.name].active +
              this.totales[this.sucursalName][categoria.name].inactive;
          }
        });
      }

      // Check if any categories were not initialized for any branch office
      Object.keys(this.totales).forEach(sucursal => {
        if (!this.totales[sucursal][categoria.name]) {
          this.totales[sucursal][categoria.name] = {
            available: 0,
            active: 0,
            inactive: 0,
            total: 0
          };
        }
      });
    });

    // Filter categories with few materials available for the logged-in user's branch office
    this.categoriasConPocosMateriales = this.categories
      .filter(categoria => {
        const sucursalName = this.obtenerNombreSucursal(this.loggedInUser?.branch_office_id ?? 0);
        const availableMaterials = this.totales[sucursalName]?.[categoria.name]?.available;
        return sucursalName && availableMaterials !== undefined && availableMaterials < 5;
      })
      .map(categoria => ({
        categoryName: categoria.name,
        availableMaterials: this.totales[this.obtenerNombreSucursal(this.loggedInUser?.branch_office_id ?? 0)]?.[categoria.name]?.available
      }));

  }


  obtenerNombreSucursal(sucursalId: number): string {
    // Find the branch office with the given ID
    const sucursal = this.sucursales.find(sucursal => sucursal.id === sucursalId);
    // Return the name of the branch office if found, otherwise return an empty string
    return sucursal ? sucursal.name : '';
  }

  getTotalSucursal(categorias: SucursalTotals): number {
    let total = 0;
    // Iterate through each category in the SucursalTotals object
    for (let categoria in categorias) {
      if (categorias.hasOwnProperty(categoria)) {
        // Add the total count of materials for each category to the overall total
        total += categorias[categoria]?.total || 0;
      }
    }
    return total;
  }

  obtenerCantidadEmpleadosPorSucursal(): void {
    // Fetch the number of employees per branch office from the API
    this.ApiRequestService.getEmployeesByBranchOffice().subscribe(
      (response: any[]) => { // Adjust the response type to 'any[]' if the service returns an array of objects
        // Store the fetched data
        this.empleadosPorSucursal = response;
      },
      error => {
        // Log any errors that occur while fetching the number of employees per branch office
        console.error('Error al obtener la cantidad de empleados por sucursal:', error);
      }
    );
  }

  obtenerReportes() {
    // Fetch the list of incidences from the API
    this.ApiRequestService.listIncidences().subscribe(
      (response: Incidence[]) => {
        // Filter incidences to include only pending ones
        this.incidencesPending = response.filter((incidence: Incidence) => incidence.state === 'pending');
        // Set cargaDatos to false after the data has been loaded
        this.cargaDatos = false;
      },
      error => {
        // Log any errors that occur while fetching reports
        console.error('Error al obtener reportes:', error);
      }
    );
  }


  obtenerReportesDelEmpleado() {
    const now = Date.now(); // Current timestamp
    const DaysInMilliseconds = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

    // Fetch the list of incidences from the API
    this.ApiRequestService.listIncidences().subscribe(
      (response: Incidence[]) => {
        // Filter incidences to include only those related to the logged-in employee and meet certain conditions
        this.incidencesSend = response
          .filter((incidence: Incidence) => incidence.employee?.id === this.loggedInUser?.id) // Filter by employee
          .filter((incidence: Incidence) => {
            // Filter reports that meet the conditions
            if (incidence.state === 'pending') {
              return true; // If the state is 'pending', include in the table
            } else if (incidence.state === 'accepted' || incidence.state === 'rejected') {
              // If the state is 'accepted' or 'rejected', check if the update date is within the last 2 days
              const updateDate = incidence.updated_at ? new Date(incidence.updated_at).getTime() : 0;
              return now - updateDate <= DaysInMilliseconds;
            } else {
              // For other states, exclude from the table
              return false;
            }
          });
        // Set cargaDatos to false after the data has been loaded
        this.cargaDatos = false;
      },
      error => {
        // Log any errors that occur while fetching reports for the employee
        console.error('Error al obtener los reportes del empleado:', error);
      }
    );
  }

}
