import { Component, NgModule, OnInit } from '@angular/core';
import { AttributeCategoryMaterial } from 'src/app/model/AttributeCategoryMaterial';
import { Category } from 'src/app/model/Category';
import { Employee } from 'src/app/model/Employee';
import { Incidence } from 'src/app/model/Incidence';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { KeyValue } from '@angular/common';

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
  totales: { [key: string]: { [key: string]: number } } = {}; // Objeto anidado para almacenar los totales
  categories: Category[] = [];
  empleadosPorSucursal: any[] = []; // Inicializa como un array vacío en lugar de un objeto vacío

  constructor(private ApiRequestService: ApiRequestService, private authControlService: UsuariosControlService) { }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(
      (user) => {
        this.loggedInUser = user;
      }
    );
    this.obtenerReportes();
    this.obtenerCantidadMaterial();
    this.mostrarMaterialesDisponiblesBajos();
    this.obtenerReportesDelEmpleado();
    this.obtenerCantidadEmpleadosPorSucursal();
  }

  obtenerCantidadMaterial(){
    this.ApiRequestService.categoryMaterial().subscribe(category => {
      this.categories = category;
      console.log(this.categories)
        this.calcularTotales();
        console.log(this.totales)
        this.cargaDatos = false;
      }
    );
  }

  calcularTotales(): void {
    this.totales = {};

    // Iterar sobre cada categoría
    this.categories.forEach(categoria => {
      // Verificar si la categoría tiene materiales y si es un objeto
      if (categoria.attributeCategoryMaterials && typeof categoria.attributeCategoryMaterials === 'object') {
        // Iterar sobre cada objeto en attributeCategoryMaterials
        Object.values(categoria.attributeCategoryMaterials).forEach((materialObj: any) => {
          // Obtener el nombre de la sucursal del material
          const sucursalName = materialObj.material?.branch_office?.name;
          if (sucursalName) {
            // Verificar si la sucursal ya existe en el objeto totales
            if (!this.totales[sucursalName]) {
              this.totales[sucursalName] = {};
            }
            // Incrementar el contador de la categoría para la sucursal correspondiente
            if (!this.totales[sucursalName][categoria.name]) {
              this.totales[sucursalName][categoria.name] = 1;
            } else {
              this.totales[sucursalName][categoria.name]++;
            }
          }
        });
      }
    });
  }

  calcularTotalSucursal(materials: { [key: string]: number }): number {
    let total = 0;
    for (const key in materials) {
      if (materials.hasOwnProperty(key)) {
        total += materials[key];
      }
    }
    return total;
  }

  obtenerCantidadEmpleadosPorSucursal(): void {
    this.ApiRequestService.getEmployeesByBranchOffice().subscribe(
      (response: any[]) => { // Ajusta el tipo de respuesta a 'any[]' si el servicio devuelve un array de objetos
        this.empleadosPorSucursal = response;
        console.log(this.empleadosPorSucursal);
      },
      error => {
        console.error('Error al obtener la cantidad de empleados por sucursal:', error);
      }
    );
  }

  mostrarMaterialesDisponiblesBajos() {
    // Filtrar los materiales con una cantidad disponible de menos de 5 unidades
    const mensajeDiv = document.querySelector('.message');
    // Limpiar el contenido actual del div
    if (mensajeDiv !== null) {
      mensajeDiv.innerHTML = '';

      const materialesDisponiblesBajos = this.materials.filter(material => material.availableMaterial < 5);
      // Mostrar los materiales disponibles bajos en pantalla
      materialesDisponiblesBajos.forEach(material => {
        if (material.availableMaterial < 5) {
          // Crear un elemento de párrafo para el mensaje
          const mensajeParrafo = document.createElement('p');
          // Asignar el contenido del mensaje al elemento de párrafo
          mensajeParrafo.textContent = `Quedan pocas unidades disponibles de ${material.name}: ${material.availableMaterial}`;
          mensajeParrafo.style.color = 'red'; // Cambiar el color del texto a rojo
          mensajeParrafo.style.fontSize = '16px'; // Cambiar el tamaño de la fuente


          // Agregar el elemento de párrafo al div
          mensajeDiv?.appendChild(mensajeParrafo);
        }
      });
      if (materialesDisponiblesBajos.length === 0) {
        const mensajeParrafo = document.createElement('p');
        // Asignar el contenido del mensaje al elemento de párrafo
        mensajeParrafo.textContent = `Los niveles de stock estan correctos`;
        mensajeParrafo.style.color = 'green'; // Cambiar el color del texto a rojo
        mensajeParrafo.style.fontSize = '16px'; // Cambiar el tamaño de la fuente
        // Agregar el elemento de párrafo al div
        mensajeDiv?.appendChild(mensajeParrafo);
      }
    }
    this.cargaDatos = false;
  }

  obtenerReportes() {
    this.ApiRequestService.listIncidences().subscribe(
      (response:Incidence[]) => {
        this.incidencesPending = response.filter((incidence:Incidence) => incidence.state === 'pending');
        this.cargaDatos = false;
        console.log(this.incidencesPending)
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
      (response:Incidence[]) => {
        this.incidencesSend = response
          .filter((incidence:Incidence)=> incidence.employee?.id === this.loggedInUser?.id) // Filtrar por empleado
          .filter((incidence:Incidence) => {
            // Filtrar los reportes que cumplen las condiciones
            if (incidence.state === 'pending') {
              return true; // Si el estado es 'pending', mostrar en la tabla
            } else if (incidence.state === 'accepted' || incidence.state === 'rejected') {
              // Si el estado es 'accepted' o 'rejected', verificar si la fecha de actualización es menor o igual a 5 días atrás
              const updateDate = incidence.updated_at ? new Date(incidence.updated_at).getTime() : 0;              return now - updateDate <= DaysInMilliseconds;
            } else {
              // Para otros estados, no mostrar en la tabla
              return false;
            }
          })
        this.cargaDatos = false;
        console.log(this.incidencesPending)
      },
      error => {
        console.error('Error al obtener los reportes del empleado:', error);
      }
     );
  }
}
