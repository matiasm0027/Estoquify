import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { forkJoin } from 'rxjs';
import { Employee } from 'src/app/model/Employee';
import { Material } from 'src/app/model/Material';
import { AttributeCategoryMaterial } from 'src/app/model/AttributeCategoryMaterial';

@Component({
  selector: 'app-material-details',
  templateUrl: './material-details.component.html',
  styleUrls: ['./material-details.component.css']
})
export class MaterialDetailsComponent implements OnInit {
  materialId!: number;
  mostrarModalEditar: boolean = false;
  formularioMaterial!: FormGroup;
  categoria_id!: number;
  estados: any[] = [
    { value: 'available', label: 'Avaliable' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' }
  ];
  successMessage2!: string;
  cargaDatos: boolean = true;

  userRole!: any;
  loggedInUser!: Employee | null;
  departamentos: { id: number; name: string; }[] = [];
  sucursales: { id: number; name: string; }[] = [];
  atributos: { id: number; name: string; }[] = [];
  material!: Material;
  errorMessage!: string;
  successMessage!: string;
  attriCateMatDetail!: AttributeCategoryMaterial[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private ApiRequestService: ApiRequestService,
    private authControlService: UsuariosControlService,
  ) { }

  ngOnInit(): void {
    this.userRole = this.authControlService.hasRole();
    this.authControlService.getLoggedUser().subscribe(
      (user) => {
        this.loggedInUser = user;
      }
    );
    this.cargarOpciones();
    this.getMaterialIdFromRoute();
    this.getMaterialDetails();
  }

  initForm() {
    const formControls: { [key: string]: any } = {
      name: [this.material.name, [Validators.required, Validators.maxLength(30)]],
      branch_office_id: [this.material.branch_office?.id, Validators.required],
      state: [this.material.state, Validators.required],
      lowDate: [' ']
    };
    if (this.material.attributeCategoryMaterials) {
      this.material.attributeCategoryMaterials.forEach((item, index) => {
        formControls['atributo' + index] = [item.value, [Validators.required, Validators.maxLength(50)]];
      });
    }
    this.formularioMaterial = this.fb.group(formControls);
  }

  cargarOpciones() {
    forkJoin([
      this.authControlService.cargarSucursales(),
      this.authControlService.cargarAtributos(),
      this.authControlService.cargarDepartamentos(),
    ]).subscribe(
      ([sucursales, atributos, departamentos]) => {
        this.sucursales = sucursales;
        this.atributos = atributos;
        this.departamentos = departamentos;
      },
      (error) => {
        console.error('Error loading options', error);
      }
    );
  }

  getMaterialIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.materialId = +params['id'];
    });
  }

  getMaterialDetails(): void {
    this.ApiRequestService.getMaterial(this.materialId)
      .subscribe(
        (response) => {
          this.material = response;
          this.extractAttributes();
          this.cargaDatos = false;
          console.log(this.material)
          console.log(this.attriCateMatDetail)
          this.initForm();
        },
        (error) => {
          this.errorMessage = error.error.error;
        }
      );
  }

  extractAttributes(): void {
    if (this.material && this.material.attributeCategoryMaterials) {
      this.attriCateMatDetail = this.material.attributeCategoryMaterials;
    }
  }

  setFechaActual(checked: boolean) {
    if (checked) {
      // Obtiene la fecha actual y la formatea como yyyy-mm-dd
      const today = new Date().toISOString().slice(0, 10);
      // Establece la fecha actual como fecha de baja
      this.formularioMaterial.patchValue({
        lowDate: today
      });
    }
  }

  mostrarModal() {
    this.mostrarModalEditar = true;
  }

  cerrarModal() {
    this.mostrarModalEditar = false;
    this.getMaterialDetails();
    this.formularioMaterial.reset();
  }

  editarMaterial(): void {
    if (this.formularioMaterial.valid) {
      let bajaFecha = null;
      if (this.material.low_date !== null) {
        bajaFecha = this.material.low_date;
      } else {
        bajaFecha = this.formularioMaterial.value.lowDate;
      }

      const materialEditado:Material = {
          id: this.material.id,
          name: this.formularioMaterial.value.name,
          high_date: this.material.high_date,
          low_date: bajaFecha,
          branch_office_id: this.formularioMaterial.value.branch_office_id,
          state: this.formularioMaterial.value.state,
          attributeCategoryMaterials: []
      };

      // Agregar los valores de los atributos al objeto attributeCategoryMaterials
      if (this.material.attributeCategoryMaterials) {
        this.material.attributeCategoryMaterials.forEach((item, index) => {
          materialEditado.attributeCategoryMaterials?.push({
            id: item.id,
            attribute_id: item.attribute?.id ?? 0,
            category_id: item.category?.id ?? 0,
            material_id: item.id,
            value: this.formularioMaterial.value[`atributo${index}`]
        });
      });
      }

      this.ApiRequestService.editMaterial(this.material.id, materialEditado).subscribe(
        (response: any) => {
          this.successMessage2 = response.message;
          this.cerrarModal();
        },
        (error: any) => {
          this.errorMessage = error.error.error;
        }
      );
    } else {
      this.errorMessage ='Invalid Form';
    }
  }

  confirmDelete(material: Material, id:number): void {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el: ${material.name}?`);
    if (confirmacion) {
      if(id === 0){
        this.router.navigate(['/categories_view']);
      }else{
      this.deleteMaterial(material.id);

      }
    }
  }

  deleteMaterial(id: number): void {

    // Llamar al servicio para eliminar el material
    this.ApiRequestService.deleteMaterial(id).subscribe(
      (response) => {
        this.router.navigate(['/categories_details/' + this.attriCateMatDetail[0].category?.id]);
        alert(response.message);
        // Navegar a la vista de materiales después de eliminar con éxito
      },
      error => {
        console.error(`Error al eliminar material con ID ${id}:`, error);
        // Manejar errores en caso de que la eliminación falle
      }
    );
  }

  getColor(state: string | undefined): string {
    if (state === 'available') {
      return 'green'; // verde para estado 'available'
    } else if (state === 'inactive') {
      return 'red'; // rojo para estado 'inactive'
    } else if (state === 'active') {
      return 'blue'; // azul para estado 'active'
    } else {
      return 'black'; // color por defecto
    }
  }


  desasignarMaterial(employeeId: number) {
    this.successMessage = "";
    // Lógica para desasignar el material del empleado actualmente asignado
    const materialId = this.material.id;
    // Llama al servicio para desasignar el material
    this.ApiRequestService.desasignarMaterial(materialId, employeeId).subscribe(
      (response) => {
        // Actualiza la vista después de desasignar el material
        this.successMessage = response.message;
        this.getMaterialDetails();
      },
      (error) => {
        console.error('Error al desasignar el material:', error);
      }
    );
  }

  asignarMaterial(employeeId: number) {
    this.successMessage = "";
    // Lógica para asignar el material al empleado con el ID proporcionado
    const materialId = this.material.id;
    // Llama al servicio para asignar el material al empleado
    this.ApiRequestService.asignarMaterial(materialId, employeeId).subscribe(
      (response) => {
        // Actualiza la vista después de asignar el material
        this.successMessage = response.message;
        this.getMaterialDetails();
      },
      (error) => {
        console.error('Error al asignar el material:', error);
      }
    );
  }

  showOptions: boolean = false;

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  private convertToCsv(data: Material): string {
    if (!data || !data.attributeCategoryMaterials) {
      console.error('Los datos de la tabla no son válidos o están vacíos.');
      return '';
    }

    const csvRows = [];
    const headers = ['ID', 'Nombre', 'Fecha Alta', 'Fecha Baja', 'Atributos', 'Sucursal', 'Estado']; // Ajusta los encabezados
    csvRows.push(headers.join(','));

    const attributes = data.attributeCategoryMaterials?.map((attribute) => `${attribute.attribute?.name} - ${attribute.value}`).join(';\n ');

    const values = [
      data.id,
      this.escapeCsvValue(data.name),
      data.high_date,
      data.low_date ?? 'N/D',
      this.escapeCsvValue(attributes),
      data.branch_office?.name,
      data.state

    ];
    const csvRow = values.map(value => this.escapeCsvValue(value)).join(',');
    csvRows.push(csvRow);

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
    if (!this.material) {
      console.error('Los datos de la tabla no son válidos o están vacíos.');
      return;
    }

    const material = this.material;
    const attributes = this.material.attributeCategoryMaterials?.map((attribute) => `${attribute.attribute?.name} - ${attribute.value}`).join(';\n');

    const doc = new jsPDF();

    // Encabezado
    doc.text('Informacion de Material', 10, 10);


    // Datos del material
    const materialData = [
      ['ID', 'Nombre', 'Fecha Alta', 'Fecha Baja', 'Atributos', 'Sucursal', 'Estado'],
      [material.id, material.name, material.high_date, material.low_date ?? 'N/D', attributes, material.branch_office?.name, material.state]
    ];

    if(this.material.employee_materials){
      const employee = material.employee_materials?[0] : null;
      const employeeData = [
        ['ID', 'Nombre', 'Apellido', 'Fecha de Asignacion', 'Fecha de Devolucion'],
      ];
    }
    // Agregar tabla al PDF
    (doc as any).autoTable({
      head: materialData.slice(0, 1), // Solo la fila de encabezado
      body: materialData.slice(1) // Resto de las filas de datos
    });

    // Guardar el PDF
    doc.save(`${material.name}.pdf`);
  }



  downloadCsv() {
    if (!this.material.attributeCategoryMaterials) {
      console.error('No hay datos de empleado disponibles');
      return;
    }
    const csvContent = this.convertToCsv(this.material);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${this.material.name}.csv`;


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
