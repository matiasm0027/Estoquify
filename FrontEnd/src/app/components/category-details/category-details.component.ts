import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent implements OnInit {
  page: number = 1;
  categoryId!: number;
  categoryDetails: any = {};
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;
  mostrarModalAgregar: boolean = false;
  mostrarModalFiltros: boolean = false;
  sucursales: any[] = [];
  atributos: any[] = [];
  formularioMaterial!: FormGroup;
  categories: any[] = [];
  fechaInicio: string = ''; 
  fechaFin: string = ''; 
  filtroEstado: string = ''; 
  filtroSucursal: string = '';
  detallesMaterial: any = {};
  atributosAdicionales: any[] = [];


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ApiRequestService: ApiRequestService,
    private router: Router,
    private controlUsuario: UsuariosControlService
  ) {}

  ngOnInit(): void {
    this.getCategoriaIdFromRoute();
    this.getCategoriaDetails();
    this.obtenerSucursales();
    this.obtenerAtributos();
    this.initForm();
  }

  initForm() {
    this.formularioMaterial = this.fb.group({
      nombre: ['', Validators.required],
      value: ['', Validators.required],
      sucursal: ['', Validators.required],
      atributo: ['', Validators.required]
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarWidth = this.sidebarVisible ? 250 : 0;
  }

  obtenerSucursales() {
    this.ApiRequestService.listBranchOffices().subscribe(
      (response: any[]) => {
        this.sucursales = response;
        
      },
      error => {
        console.error('Error al obtener sucursales:', error);
      }
    );
  }

  obtenerAtributos() {
    this.ApiRequestService.listAtributos().subscribe(
      (response: any[]) => {
        this.atributos = response;
        
      },
      error => {
        console.error('Error al obtener sucursales:', error);
      }
    );
  }

  getNombreSucursal(branch_office_id: number): string {
    const sucursal = this.sucursales.find(suc => suc.id === branch_office_id);
    return sucursal ? sucursal.name : 'N/A';
  }

  getCategoriaIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id'];
      this.controlUsuario.setNumero(this.categoryId)
    });
  }

  getCategoriaDetails(): void {
    this.ApiRequestService.getCategoriaDetails(this.categoryId)
      .subscribe(
        (categoria: any) => {
          this.detallesMaterial = categoria; // Convertir el objeto de categoría a una matriz
          console.log(this.detallesMaterial)
          this.aplicarFiltro();
        },
        (error: any) => {
          console.error('Error al obtener detalles de la categoría:', error);
        }
      );
  }

  agregarAtributo() {
    // Agregar un nuevo conjunto de campos para atributo y valor
    this.atributosAdicionales.push({});
    const controlNameAtributo = `atributo${this.atributosAdicionales.length + 1}`;
    const controlNameValor = `valor${this.atributosAdicionales.length + 1}`;
    this.formularioMaterial.addControl(controlNameAtributo, this.fb.control('', Validators.required));
    this.formularioMaterial.addControl(controlNameValor, this.fb.control('', Validators.required));
  }

  eliminarAtributo(index: number) {
    this.atributosAdicionales.splice(index, 1);
    const controlNameAtributo = `atributo${index + 2}`;
    const controlNameValor = `valor${index + 2}`;
    this.formularioMaterial.removeControl(controlNameAtributo);
    this.formularioMaterial.removeControl(controlNameValor);
}

  volver() {
    this.router.navigate(['/categories_view']);
  }

  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  mostrarModalDeFiltros(): void {
    this.mostrarModalFiltros = true;
  }

  cerrarModalFiltros(){
    this.mostrarModalFiltros = false;
  }

  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.getCategoriaDetails();
    this.formularioMaterial.reset();
  }

  agregarMaterial() {
    if (this.formularioMaterial.valid) {
      const nombre = this.formularioMaterial.value.nombre;
      const sucursal = this.formularioMaterial.value.sucursal;
      const atributoId = this.formularioMaterial.value.atributo; // Obtener el ID del atributo seleccionado
  
      // Obtener el nombre del atributo seleccionado
      const nombreAtributo = this.atributos.find(atributo => atributo.id === atributoId)?.name;
  
      // Construir el atributo principal
      const atributoPrincipal = this.construirAtributoPrincipal(atributoId, nombreAtributo);
  
      // Construir los atributos extras
      const atributosExtras = this.construirAtributosExtras();
  
      // Crear el objeto del material con los valores proporcionados
      const nuevoMaterial = this.construirObjetoMaterial(nombre, sucursal, atributoPrincipal, atributosExtras);
  
      // Llamar al servicio para agregar el material
      this.ApiRequestService.agregarMaterial(nuevoMaterial).subscribe(
        (response: any) => {
          console.log('Material agregado:', response);
          // Cerrar el modal y limpiar el formulario
          this.cerrarModal();
        },
        (error: any) => {
          console.error('Error al agregar el material:', error);
        }
      );
    } else {
      // Marcar los campos inválidos
      this.formularioMaterial.markAllAsTouched();
    }
  }
  
  // Función para construir el atributo principal
  construirAtributoPrincipal(atributoId: number, nombreAtributo: string): any {
    return {
      name: nombreAtributo,
      pivot: {
        category_id: this.categoryId,
        attribute_id: atributoId,
        value: this.formularioMaterial.value.value
      }
    };
  }
  
  // Función para construir los atributos extras
  construirAtributosExtras(): any[] {
    const atributosExtras = [];
  
    for (let i = 0; i < this.atributosAdicionales.length; i++) {
      const atributoExtraId = this.formularioMaterial.value[`atributo${i + 2}`];
      const valorExtra = this.formularioMaterial.value[`valor${i + 2}`];
      const nombreAtributoExtra = this.atributos.find(atributo => atributo.id === atributoExtraId)?.name;
  
      const atributoExtra = {

          category_id: this.categoryId,
          attribute_id: atributoExtraId,
          value: valorExtra
        
      };
  
      atributosExtras.push(atributoExtra);
    }
  
    return atributosExtras;
  }
  
  // Función para construir el objeto del material
  construirObjetoMaterial(nombre: string, sucursal: number, atributoPrincipal: any, atributosExtras: any[]): any {
    return {
      material: {
        name: nombre,
        high_date: new Date().toISOString(), // Obtener la fecha actual
        branch_office_id: sucursal,
        pivot: [
          { ...atributoPrincipal.pivot },
          ...atributosExtras.map(atributoExtra => ({
            category_id: atributoExtra.category_id,
            attribute_id: atributoExtra.attribute_id,
            value: atributoExtra.value
          }))
        ],
        state: "available"
      },
      category_id: this.categoryId,
      category_name: "",
      
    };
  }

  aplicarFiltro(): void {
    // Obtener los filtros seleccionados
    const filtroFechaInicio = this.fechaInicio;
    const filtroFechaFin = this.fechaFin;
    const filtroEstadoSeleccionado = this.filtroEstado;
    const filtroSucursalSeleccionado = parseInt(this.filtroSucursal, 10); // Convertir a entero

    // Aplicar los filtros
    this.categoryDetails.materials = this.detallesMaterial.materials.filter((material: any) => {
        let cumpleFiltroFecha = true;
        let cumpleFiltroEstado = true;
        let cumpleFiltroSucursal = true;

        // Filtrar por fecha de alta
        if (filtroFechaInicio && filtroFechaFin) {
            const fechaMaterial = new Date(material.high_date).getTime();
            const fechaInicio = new Date(filtroFechaInicio).getTime();
            const fechaFin = new Date(filtroFechaFin).getTime();

            if (isNaN(fechaMaterial) || isNaN(fechaInicio) || isNaN(fechaFin)) {
                throw new Error('Error al convertir las fechas');
            }

            cumpleFiltroFecha = fechaMaterial >= fechaInicio && fechaMaterial <= fechaFin;
        }

        // Filtrar por estado
        if (filtroEstadoSeleccionado) {
            cumpleFiltroEstado = material.state === filtroEstadoSeleccionado;
        }

        // Filtrar por sucursal
        if (filtroSucursalSeleccionado) { // Verificar si el filtro es un número válido
            cumpleFiltroSucursal = material.branch_office_id === filtroSucursalSeleccionado;
        }

        // Devolver verdadero si el material cumple todos los filtros
        return cumpleFiltroFecha && cumpleFiltroEstado && cumpleFiltroSucursal;
    });
}

  }


