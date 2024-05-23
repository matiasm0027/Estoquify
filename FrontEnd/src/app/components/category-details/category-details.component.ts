import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { jsPDF } from 'jspdf'; // Importing jsPDF library for PDF generation
import { Material } from 'src/app/model/Material'; // Importing Material model
import { forkJoin } from 'rxjs'; // Importing forkJoin operator from RxJS
import { Category } from 'src/app/model/Category'; // Importing Category model
import { AttributeCategoryMaterial } from 'src/app/model/AttributeCategoryMaterial'; // Importing AttributeCategoryMaterial model
import 'jspdf-autotable'; // Importing jspdf-autotable plugin for PDF table creation

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
  sucursales: { id: number; name: string; }[] = [];
  atributos: { id: number; name: string; }[] = [];
  atributosAdicionales: any[] = [];
  materialData!: Material[];
  category!: Category;
  materialFiltrados: Material[] = [];
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

  // Constructor with dependency injection
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ApiRequestService: ApiRequestService,
    private router: Router,
    private authControlService: UsuariosControlService
  ) { }

  // Angular lifecycle hook, called after Angular initializes the component
  ngOnInit(): void {
    // Initialization logic
    this.userRole = this.authControlService.hasRole();
    this.cargarOpciones();
    this.getCategoriaIdFromRoute();
    this.filtrarMateriales();
    this.initForm();
    this.getCategoriaDetails();
  }

  // Function to initialize the form
  initForm() {
    this.formularioMaterial = this.fb.group({
      nombre: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]+$'), this.cantidadValidator]],
      value: ['', Validators.required],
      sucursal: ['', Validators.required],
      atributo: ['', Validators.required]
    });
  }

  // Validator function for 'cantidad' control in the form
  cantidadValidator(control: AbstractControl) {
    const cantidad = parseInt(control.value);
    if (cantidad < 1) {
      return { cantidadMinima: true };
    } else if (cantidad > 20) {
      return { cantidadMaxima: true };
    } else {
      return null;
    }
  }

  // Function to load options like sucursales and atributos
  cargarOpciones() {
    forkJoin([
      this.authControlService.cargarSucursales(),
      this.authControlService.cargarAtributos()
    ]).subscribe(
      ([sucursales, atributos]) => {
        this.sucursales = sucursales;
        this.atributos = atributos;
      },
      (error) => {
        console.error('Error loading options', error);
      }
    );
  }

  // Function to get category id from route parameters
  getCategoriaIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id'];
      this.cargaDatos = false;
    });
  }

  // Function to extract materials from category data
  extractMaterials(): void {
    if (this.category && this.category.attributeCategoryMaterials) {
      const attributeCategoryMaterialsArray = Object.values(this.category.attributeCategoryMaterials);
      this.materialData = attributeCategoryMaterialsArray.map((acm: AttributeCategoryMaterial) => acm.material).filter(material => material != null) as Material[];
    }
  }

  // Function to get category details
  getCategoriaDetails() {
    try {
      this.ApiRequestService.categoryMaterialInfo(this.categoryId)
        .subscribe(response => {
          this.category = response;
          this.extractMaterials();
          this.aplicarFiltro();
          this.cargaDatos = false;
        });
    } catch (error) {
      console.error('Error al obtener empleados:', error);
    }
  }

  // Function to filter materials based on search term
  filtrarMateriales() {
    this.successMessage = "";
    const searchTermTrimmed = this.searchTerm.trim();
    if (!searchTermTrimmed) {
      this.materialFiltrados = this.materialData;
    } else {
      this.materialFiltrados = this.materialData.filter((material) => {
        return material.name.toLowerCase().includes(searchTermTrimmed.toLowerCase());
      });
      if (this.materialFiltrados.length === 0) {
        this.successMessage = "No hay ningún material con esos datos.";
      }
    }
  }

  // Function to add additional attribute fields dynamically
  agregarAtributo() {
    // Agregar un nuevo conjunto de campos para atributo y valor
    this.atributosAdicionales.push({});
    const controlNameAtributo = `atributo${this.atributosAdicionales.length + 1}`;
    const controlNameValor = `valor${this.atributosAdicionales.length + 1}`;
    this.formularioMaterial.addControl(controlNameAtributo, this.fb.control('', Validators.required));
    this.formularioMaterial.addControl(controlNameValor, this.fb.control('', Validators.required));
  }

  // Function to delete an additional attribute field
  eliminarAtributo(index: number) {
    this.atributosAdicionales.splice(index, 1);
    const controlNameAtributo = `atributo${index + 2}`;
    const controlNameValor = `valor${index + 2}`;
    this.formularioMaterial.removeControl(controlNameAtributo);
    this.formularioMaterial.removeControl(controlNameValor);
  }


  // Function to navigate back to previous page
  volver() {
    this.router.navigate(['/categories_view']);
  }

  // Function to show the modal for adding materials
  mostrarModal() {
    this.mostrarModalAgregar = true;
  }

  // Function to show the filter modal
  mostrarModalDeFiltros(): void {
    this.mostrarModalFiltros = true;
  }

  // Function to close the filter modal
  cerrarModalFiltros() {
    this.mostrarModalFiltros = false;
  }

  // Function to close the material addition modal
  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.getCategoriaDetails();
    this.formularioMaterial.reset();
  }

  // Function to add a new material
  agregarMaterial() {
    if (this.formularioMaterial.valid) {
      const nombreBase = this.formularioMaterial.value.nombre;
      const cantidad = parseInt(this.formularioMaterial.value.cantidad, 10);
      const sucursal = this.formularioMaterial.value.sucursal;
      const atributoId = this.formularioMaterial.value.atributo;
      const nombreAtributo = this.atributos?.find(atributo => atributo.id === atributoId)?.name ?? 'Valor predeterminado';
      const atributoPrincipal = this.construirAtributoPrincipal(atributoId, nombreAtributo);
      const atributosExtras = this.construirAtributosExtras();

      for (let i = 1; i <= cantidad; i++) {
        const nuevoMaterial = this.construirObjetoMaterial(nombreBase, sucursal, atributoPrincipal, atributosExtras);
        this.ApiRequestService.agregarMaterial(nuevoMaterial).subscribe(
          (response: any) => {
            this.successMessage = response.message;
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
      this.formularioMaterial.markAllAsTouched();
      this.errorMessage = "Formulario inválido";
    }
  }

  // Function to build the main attribute object
  construirAtributoPrincipal(atributoId: number, nombreAtributo: string): AttributeCategoryMaterial {
    return new AttributeCategoryMaterial(
      0,
      0,
      atributoId,
      this.categoryId,
      this.formularioMaterial.value.value
    );
  }

  // Function to build additional attribute objects
  construirAtributosExtras(): AttributeCategoryMaterial[] {
    const atributosExtras: AttributeCategoryMaterial[] = [];

    for (let i = 0; i < this.atributosAdicionales.length; i++) {
      const atributoExtraId = this.formularioMaterial.value[`atributo${i + 2}`];
      const valorExtra = this.formularioMaterial.value[`valor${i + 2}`];
      const atributoExtra = new AttributeCategoryMaterial(
        0,
        0,
        atributoExtraId,
        this.categoryId,
        valorExtra
      );
      atributosExtras.push(atributoExtra);
    }

    return atributosExtras;
  }

  // Function to build the material object
  construirObjetoMaterial(nombre: string, sucursal: number, atributoPrincipal: AttributeCategoryMaterial, atributosExtras: AttributeCategoryMaterial[]): Material {
    return new Material(
      0,
      nombre,
      null,
      new Date(),
      "available",
      sucursal,
      undefined,
      [
        atributoPrincipal,
        ...atributosExtras
      ],
      undefined
    );
  }

  // Function to apply filters to materials
  aplicarFiltro(): void {
    const filtroFechaInicio = this.fechaInicio;
    const filtroFechaFin = this.fechaFin;
    const filtroEstadoSeleccionado = this.filtroEstado;
    const filtroSucursalSeleccionado = parseInt(this.filtroSucursal, 10);

    this.materialFiltrados = this.materialData.filter((material: any) => {
      let cumpleFiltroFecha = true;
      let cumpleFiltroEstado = true;
      let cumpleFiltroSucursal = true;

      if (filtroFechaInicio && filtroFechaFin) {
        const fechaMaterial = new Date(material.high_date).getTime();
        const fechaInicio = new Date(filtroFechaInicio).getTime();
        const fechaFin = new Date(filtroFechaFin).getTime();

        if (isNaN(fechaMaterial) || isNaN(fechaInicio) || isNaN(fechaFin)) {
          throw new Error('Error al convertir las fechas');
        }

        cumpleFiltroFecha = fechaMaterial >= fechaInicio && fechaMaterial <= fechaFin;
      }

      if (filtroEstadoSeleccionado) {
        cumpleFiltroEstado = material.state === filtroEstadoSeleccionado;
      }

      if (filtroSucursalSeleccionado) {
        cumpleFiltroSucursal = material.branch_office?.id === filtroSucursalSeleccionado;
      }

      return cumpleFiltroFecha && cumpleFiltroEstado && cumpleFiltroSucursal;
    });
  }

  showOptions: boolean = false;
  // Function to toggle options display
  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  // Helper function to convert data to CSV format
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
        material.branch_office?.name,
        material.state
      ];
      const csvRow = values.map(value => this.escapeCsvValue(value)).join(',');
      csvRows.push(csvRow);
    });

    return csvRows.join('\n');
  }

  // Function to download CSV or PDF format
  downloadCsvOrPdf(format: string): void {
    if (format === 'csv') {
      this.downloadCsv();
    } else if (format === 'pdf') {
      this.downloadPdf();
    } else {
      console.error('Formato de descarga no válido.');
    }
  }

  // Function to download PDF format
  downloadPdf(): void {
    if (!this.category) {
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
        material.low_date ? material.low_date : 'N/D',
        material.branch_office?.name,
        material.state
      ]),

    });

    pdf.save(`${this.category.name}.pdf`);
  }

  // Function to download CSV format
  downloadCsv(): void {
    //if there is no data in both it shows the error message
    if (!this.category) {
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

    const csvContenido = this.convertToCsv({ materials: filteredMaterials });

    const blob = new Blob([csvContenido], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${this.category.name}.csv`;

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Function to escape CSV value
  private escapeCsvValue(value: any): string {
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

}


