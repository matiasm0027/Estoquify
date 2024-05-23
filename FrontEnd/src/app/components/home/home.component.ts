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
  constructor(private ApiRequestService: ApiRequestService, private authControlService: UsuariosControlService) { }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(
      (user) => {
        this.loggedInUser = user;
      }
    );
    this.cargarOpciones();
    this.obtenerReportes();
    this.obtenerCantidadMaterial();
    this.obtenerReportesDelEmpleado();
    this.obtenerCantidadEmpleadosPorSucursal();
  }

  cargarOpciones() {
    this.authControlService.cargarSucursales().subscribe(
      (sucursales) => {
        this.sucursales = sucursales;
      },
      (error) => {
        console.error('Error loading options', error);
      }
    );
  }

  obtenerCantidadMaterial() {
    this.ApiRequestService.categoryMaterial().subscribe(category => {
      this.categories = category;
      this.calcularTotales();
    });
  }

  calcularTotales(): void {
    this.totales = {};

    this.categories.forEach(categoria => {
      if (categoria.attributeCategoryMaterials && typeof categoria.attributeCategoryMaterials === 'object') {
        Object.values(categoria.attributeCategoryMaterials).forEach((materialObj: any) => {
          const sucursalName = materialObj.material?.branch_office?.name;
          const materialState = materialObj.material?.state;

          if (sucursalName && materialState) {
            if (!this.totales[sucursalName]) {
              this.totales[sucursalName] = {};
            }

            if (!this.totales[sucursalName][categoria.name]) {
              this.totales[sucursalName][categoria.name] = {
                available: 0,
                active: 0,
                inactive: 0,
                total: 0
              };
            }

            if (materialState === 'available') {
              this.totales[sucursalName][categoria.name].available++;
            } else if (materialState === 'active') {
              this.totales[sucursalName][categoria.name].active++;
            } else if (materialState === 'inactive') {
              this.totales[sucursalName][categoria.name].inactive++;
            }

            this.totales[sucursalName][categoria.name].total =
              this.totales[sucursalName][categoria.name].available +
              this.totales[sucursalName][categoria.name].active +
              this.totales[sucursalName][categoria.name].inactive;
          }
        });
      }
    });

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
    const sucursal = this.sucursales.find(sucursal => sucursal.id === sucursalId);
    return sucursal ? sucursal.name : ''; // Devuelve el nombre de la sucursal si se encuentra, de lo contrario devuelve una cadena vacía
  }

  getTotalSucursal(categorias: SucursalTotals): number {
    let total = 0;
    for (let categoria in categorias) {
      if (categorias.hasOwnProperty(categoria)) {
        total += categorias[categoria]?.total || 0;
      }
    }
    return total;
  }


  obtenerCantidadEmpleadosPorSucursal(): void {
    this.ApiRequestService.getEmployeesByBranchOffice().subscribe(
      (response: any[]) => { // Ajusta el tipo de respuesta a 'any[]' si el servicio devuelve un array de objetos
        this.empleadosPorSucursal = response;
      },
      error => {
        console.error('Error al obtener la cantidad de empleados por sucursal:', error);
      }
    );
  }

  obtenerReportes() {
    this.ApiRequestService.listIncidences().subscribe(
      (response: Incidence[]) => {
        this.incidencesPending = response.filter((incidence: Incidence) => incidence.state === 'pending');
        this.cargaDatos = false;
      },
      error => {
        console.error('Error al obtener reportes:', error);
      }
    );
  }

  obtenerReportesDelEmpleado() {
    const now = Date.now(); // Marca de tiempo actual
    const DaysInMilliseconds = 2 * 24 * 60 * 60 * 1000; // 1 día en milisegundos

    this.ApiRequestService.listIncidences().subscribe(
      (response: Incidence[]) => {
        this.incidencesSend = response
          .filter((incidence: Incidence) => incidence.employee?.id === this.loggedInUser?.id) // Filtrar por empleado
          .filter((incidence: Incidence) => {
            // Filtrar los reportes que cumplen las condiciones
            if (incidence.state === 'pending') {
              return true; // Si el estado es 'pending', mostrar en la tabla
            } else if (incidence.state === 'accepted' || incidence.state === 'rejected') {
              // Si el estado es 'accepted' o 'rejected', verificar si la fecha de actualización es menor o igual a 5 días atrás
              const updateDate = incidence.updated_at ? new Date(incidence.updated_at).getTime() : 0; return now - updateDate <= DaysInMilliseconds;
            } else {
              // Para otros estados, no mostrar en la tabla
              return false;
            }
          })
        this.cargaDatos = false;
      },
      error => {
        console.error('Error al obtener los reportes del empleado:', error);
      }
    );
  }
}
