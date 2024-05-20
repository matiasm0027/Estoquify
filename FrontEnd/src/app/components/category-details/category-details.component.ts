import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Material } from 'src/app/model/Material';
import { Attribute } from 'src/app/model/Attribute';
import { BranchOffice } from 'src/app/model/BranchOffice';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})

export class CategoryDetailsComponent implements OnInit {
  page: number = 1;
  categoryId!: number;

  mostrarModalAgregar: boolean = false;
  mostrarModalFiltros: boolean = false;

  roles: { id: number; name: string; }[] = [];
  departamentos: { id: number; name: string; }[] = [];
  sucursales: { id: number; name: string; }[] = [];  atributos: Attribute[] | null = null;
  atributosAdicionales: any[] = [];
  materialData: Material[] = [];
  materialFiltrados: any[] = [];

  formularioMaterial!: FormGroup;

  fechaInicio: string = '';
  fechaFin: string = '';
  filtroEstado: string = '';
  filtroSucursal: string = '';
  searchTerm: string = '';

  employeeId!: number;
  userRole!: any;

  errorMessage!: string;
  successMessage!: string;

  cargaDatos: boolean = true;

  categoryName!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ApiRequestService: ApiRequestService,
    private router: Router,
    private authControlService: UsuariosControlService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();

    this.cargarOpciones();
    this.getCategoriaIdFromRoute();
    this.getCategoriaDetails();
    this.filtrarMateriales();

    this.initForm();
  }

  initForm() {
    this.formularioMaterial = this.fb.group({
      nombre: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      value: ['', Validators.required],
      sucursal: ['', Validators.required],
      atributo: ['', Validators.required]
    });
  }

cargarOpciones() {
    forkJoin([
    //this.atributos = this.authControlService.getAttributes();
    this.authControlService.cargarSucursales()
    ]).subscribe(
      ([sucursales]) => {
        this.sucursales = sucursales;
      }
    );
  }

  getCategoriaIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.categoryId = +params['category'];
      this.cargaDatos = false;
    });
    this.route.queryParams.subscribe(params => {
      this.categoryName = params['categoryName'];
      this.cargaDatos = false;
    });
  }

  getCategoriaDetails() {
    try {
      this.ApiRequestService.getCategoriaDetails(this.categoryId)
        .subscribe(response => {
          this.materialData = response;
          // Llama a otros métodos que necesites para procesar los datos
          this.aplicarFiltro();
          this.cargaDatos = false;
        });
    } catch (error) {
      console.error('Error al obtener empleados:', error);
    }
  }


  filtrarMateriales() {
    const searchTermTrimmed = this.searchTerm.trim();
    if (!searchTermTrimmed) {
      this.materialFiltrados = this.materialData;
    } else {
      this.materialFiltrados = this.materialData.filter((material) =>
      material.name.toLowerCase().includes(searchTermTrimmed.toLowerCase())
      );
      this.successMessage = "";
      // Verificar si no se encontraron empleados
      if (this.materialFiltrados.length === 0) {
        // Mostrar mensaje en pantalla
        this.successMessage = "No hay ningún material con esos datos.";
      }
    }
  }

  getNombreSucursal(branch_office_id: number): string {
    const sucursal = this.sucursales?.find(suc => suc?.id === branch_office_id);
    return sucursal ? sucursal.name : 'N/A';
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

  cerrarModalFiltros() {
    this.mostrarModalFiltros = false;
  }

  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.getCategoriaDetails();
    this.formularioMaterial.reset();
  }

    agregarMaterial() {
      if (this.formularioMaterial.valid) {
          const nombreBase = this.formularioMaterial.value.nombre;
          const cantidad = parseInt(this.formularioMaterial.value.cantidad, 10);
          const sucursal = this.formularioMaterial.value.sucursal;
          const atributoId = this.formularioMaterial.value.atributo; // Obtener el ID del atributo seleccionado
          const nombreAtributo = this.atributos?.find(atributo => atributo.id === atributoId)?.name ?? 'Valor predeterminado';
          const atributoPrincipal = this.construirAtributoPrincipal(atributoId, nombreAtributo);
          const atributosExtras = this.construirAtributosExtras();

          // Crear múltiples materiales con nombres secuenciales
          for (let i = 1; i <= cantidad; i++) {
              //const nombreMaterial = `${nombreBase}_${i.toString().padStart(2, '0')}`;
              const nuevoMaterial = this.construirObjetoMaterial(nombreBase, sucursal, atributoPrincipal, atributosExtras);

              // Llamar al servicio para agregar el material
              this.ApiRequestService.agregarMaterial(nuevoMaterial).subscribe(
                  (response: any) => {
                      // Cerrar el modal y limpiar el formulario después de agregar cada material
                      this.successMessage= response.message;
                      if (i === cantidad) {
                          this.cerrarModal();
                      }
                  },
                  (error: any) => {
                      console.error('Error al agregar el material:', error);
                      this.errorMessage = error.error.error;
                  }
              );
          }
      } else {
          // Marcar los campos inválidos
          this.formularioMaterial.markAllAsTouched();
          this.errorMessage = "Formulario invalido";
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
      const nombreAtributoExtra = this.atributos?.find(atributo => atributo.id === atributoExtraId)?.name;

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
       // Eliminar duplicados de materiales basados en material.id


      // Aplicar los filtros
      this.materialFiltrados= this.materialData.filter((material: any) => {
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

  showOptions: boolean = false;
  toggleOptions() {
    this.showOptions = !this.showOptions;
  }
  private convertToCsv(data: any): string {
    if (!data || !data.materials || !Array.isArray(data.materials) || data.materials.length === 0) {
      console.error('Los datos de la tabla no son válidos o están vacíos.');
      return '';
    }

    const csvRows = [];
    const headers = ['ID', 'Nombre', 'Fecha Alta', 'Fecha Baja', 'Sucursal', 'Estado']; // Define los encabezados
    csvRows.push(headers.join(','));

    data.materials.forEach((material: any) => {
      const values = [
        material.id,
        this.escapeCsvValue(material.name),
        material.high_date,
        material.low_date ?? 'N/D',
        this.getNombreSucursal(material.branch_office_id),
        material.state
      ];
      const csvRow = values.map(value => this.escapeCsvValue(value)).join(',');
      csvRows.push(csvRow);
    });

    return csvRows.join('\n');
  }


  downloadCsvOrPdf(format: string): void {
    if (format === 'csv') {
      this.downloadCsv();
    } else if (format === 'pdf') {
      this.downloadPdf();
    } else {
      console.error('Formato de descarga no válido.');
    }
  }


  downloadPdf(): void {
      if (!this.materialData) {
        console.error('No hay datos disponibles para descargar');
        return;
      }

      const filteredMaterials = this.materialData.filter((material: any) => {
        let cumpleFiltroFecha = true;
        let cumpleFiltroEstado = true;
        let cumpleFiltroSucursal = true;

        return cumpleFiltroFecha && cumpleFiltroEstado && cumpleFiltroSucursal;
      });

      const pdf = new jsPDF();
      pdf.text('Lista de Materiales', 10, 10);
     (pdf as any).autoTable({
        head: [['ID', 'Nombre', 'Fecha Alta', 'Fecha Baja', 'Sucursal', 'Estado']],
        body: filteredMaterials.map((material) => [
          material.id,
          material.name,
          material.high_date,
          material.low_date !== undefined ? material.low_date : 'N/D',
          this.getNombreSucursal(material.branch_office_id),
          material.state
        ]),

      });

      //pdf.save(`${this.materialData[0].category}.pdf`);
  }


  downloadCsv(): void {
    //if there is no data in both it shows the error message
    if (!this.materialData) {
      console.error('No hay datos disponibles para descargar');
      return;
    }

    // To know the material that is downloaded depending on whether it is filtered or not
    const filteredMaterials = this.materialData.filter((material: any) => {
      let cumpleFiltroFecha = true;
      let cumpleFiltroEstado = true;
      let cumpleFiltroSucursal = true;

     return cumpleFiltroFecha && cumpleFiltroEstado && cumpleFiltroSucursal;
    });

    // Convertir los materiales filtrados a formato CSV
    const csvContenido = this.convertToCsv({ materials: filteredMaterials });

    // Crear el archivo CSV y descargarlo
    const blob = new Blob([csvContenido], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${this.materialData}.csv`;


    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private escapeCsvValue(value: any): string {
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

}


