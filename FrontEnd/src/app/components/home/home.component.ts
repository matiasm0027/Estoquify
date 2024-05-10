import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiRequestService } from 'src/app/services/api/api-request.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  employeeRole!: string;
  employee!: any;
  reportes: any[] = [];
  materials: any[] = [];
  empleado_id!: number;
  reportes_id: any[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private ApiRequestService: ApiRequestService) {}

  ngOnInit(): void {
    this.getLoggedUser();
    this.obtenerReportes();
    this.obtenerCantidadMaterial();
    this.mostrarMaterialesDisponiblesBajos();
    this.obtenerReportesDelEmpleado();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  obtenerReportes() {
    this.ApiRequestService.listReportes().subscribe(
      (response: any[]) => {

        this.reportes = response
        .filter(reporte => reporte.state === 'pending')
        .map(reporte => ({
          id: reporte.id,
          solicitud: reporte.petition,
          prioridad: reporte.priority,
          estado: reporte.state,
          type: reporte.type,
          empleado: reporte.employee_id,
          nameempleado: reporte.employee_name

        }));

      },
      error => {
        console.error('Error al obtener reportes:', error);
      }

    );

  }

  obtenerCantidadMaterial(){
    this.ApiRequestService.categoryMaterialInfo().subscribe(
      (response: any[]) => {
        this.materials = response.map(material => ({
          name: material.name, // Cambiar a category_name
          total_material: material.total_materials, // Cambiar a total_materials
          activeMaterial: material.active_materials, // Cambiar a active_materials
          availableMaterial: material.available_materials, // Cambiar a available_materials
          inactiveMaterial: material.inactive_materials // Cambiar a inactive_materials
        }));
        this.mostrarMaterialesDisponiblesBajos()
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

  }
  }

getLoggedUser(): void {
  this.ApiRequestService.me().subscribe(
    (response: any) => {
      const roleId = response.role_id;
      this.empleado_id = response.id


      if (roleId === 1) {
        this.employeeRole = 'admin';
      } else if(roleId === 2){
        this.employee = response;
        this.employeeRole = 'manager';
      }
      else {
        this.employee = response;
        this.employeeRole = 'usuario';
      }

    },
    error => {
      console.error('Error when obtaining data from the logged in user:', error);
    }
  );
}

obtenerReportesDelEmpleado() {
  const now = Date.now(); // Marca de tiempo actual
  const DaysInMilliseconds = 2 * 24 * 60 * 60 * 1000; // 1 día en milisegundos


  this.ApiRequestService.listReportes().subscribe(
    (response: any[]) => {
      this.reportes_id = response
        .filter(reporte => reporte.employee_id === this.empleado_id) // Filtrar por empleado
        .filter(reporte => {
          // Filtrar los reportes que cumplen las condiciones
          if (reporte.state === 'pending') {
            return true; // Si el estado es 'pending', mostrar en la tabla
          } else if (reporte.state === 'accepted' || reporte.state === 'rejected') {
            // Si el estado es 'accepted' o 'rejected', verificar si la fecha de actualización es menor o igual a 5 días atrás
            const updateDate = new Date(reporte.updated).getTime();
            return now - updateDate <= DaysInMilliseconds;
          } else {
            // Para otros estados, no mostrar en la tabla
            return false;
          }
        })
        .map(reporte => ({
          id: reporte.id,
          estado: reporte.state,
          type: reporte.type,
          date: reporte.date,
          update: reporte.updated
        }));

    },
    error => {
      console.error('Error al obtener los reportes del empleado:', error);
    }
  );
}



}
