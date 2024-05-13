import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-material-details',
  templateUrl: './material-details.component.html',
  styleUrls: ['./material-details.component.css']
})
export class MaterialDetailsComponent implements OnInit, OnDestroy {
  materialId!: number;
  materialDetails: any = {};
  departamentos: any[] = [];
  sucursales: any[] = [];
  mostrarModalEditar: boolean = false;
  formularioMaterial!: FormGroup;
  attributeNames: string[] = [];
  categoria_id!: number;
  atributos: any[] = [];
  estados: any[] = [
    { value: 'available', label: 'Avaliable' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' }
  ];
  asignado: any;
  successMessage!: string;
  successMessage2!: string;
  employeeId!:number;
  employeeRole!:string;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private materialService: ApiRequestService,
    private router: Router,
    private fb: FormBuilder,
    private controlUsuario: UsuariosControlService
  ) {

  }

  ngOnInit(): void {
    this.getMaterialIdFromRoute();
    this.obtenerDepartamento();
    this.obtenerSucursales();
    this.getMaterialDetails();
    this.getCategoriaID();
    this.obtenerAtributos();
    this.getLoggedUser();
    this.obtenerEmpleadoAsignado(this.materialId);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getCategoriaID(){
    this.categoria_id = this.controlUsuario.getNumero();
  }

  initForm() {
    const formControls: { [key: string]: any } = {
        nombre: [this.materialDetails.material.name, [Validators.required, Validators.maxLength(30)]],
        //valor: [this.materialDetails.material.attribute[0].pivot.value, [Validators.required, Validators.maxLength(50)]],
        sucursal: [this.materialDetails.material.branch_office_id, Validators.required],
        estado: [this.materialDetails.material.state, Validators.required],
        lowDate: [' ']
    };

    this.materialDetails.material.attribute.forEach((attribute: any, index: number) => {
        formControls['atributo' + index] = [attribute.pivot.value, [Validators.required, Validators.maxLength(50)]];
    });

    this.formularioMaterial = this.fb.group(formControls);
}


  obtenerAtributos() {
    this.materialService.listAtributos().subscribe(
      (response: any[]) => {
        this.atributos = response;

      },
      error => {
        console.error('Error al obtener atributos:', error);
      }
    );
  }

  getMaterialIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.materialId = +params['id'];
    });
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

  getMaterialDetails(): void {
    this.materialService.getMaterialDetails(this.materialId)
      .subscribe(
        (material: any) => {
          this.materialDetails = material;
          this.attributeNames = this.materialDetails.material.attribute.map((attribute: any) => attribute.name);
          this.initForm();
        },
        (error: any) => {
          console.error('Error al obtener detalles del material:', error);
        }
      );
  }

  volver() {
    this.router.navigate(['/categories_details/' + this.materialDetails.material.category[0].id]);
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
      let bajaFecha = ' ';
      if(this.materialDetails.material.low_date!==null){
         bajaFecha = this.materialDetails.material.low_date
      }else{
         bajaFecha = this.formularioMaterial.value.lowDate
      }
        const materialEditado = {
          material: {
            name: this.formularioMaterial.value.nombre,
            high_date: this.materialDetails.material.high_date,
            low_date: bajaFecha,
            branch_office_id: this.formularioMaterial.value.sucursal,
            state: this.formularioMaterial.value.estado,
            pivot: {} as { [key: string]: any } // Especificar el tipo de las claves como string
          }

        };


        // Agregar los valores de los atributos al objeto pivot
        this.materialDetails.material.attribute.forEach((attribute: any, index: number) => {

            materialEditado.material.pivot[index] = {
                attribute_id: attribute.id,
                category_id: this.materialDetails.material.category[0].id,
                value: this.formularioMaterial.value[`atributo${index}`]
            };
        });

        this.materialService.editMaterial(this.materialId, materialEditado).subscribe(
            (response: any) => {
              this.successMessage2=response.message;
                this.cerrarModal();
                this.getMaterialDetails();
            },
            (error: any) => {
                console.error('Error al editar material:', error);
            }
        );
    } else {
        console.error('Formulario inválido');
    }
}

  obtenerDepartamento() {
    this.materialService.listDepartments().subscribe(
      (response: any[]) => {
        this.departamentos = response;
      },
      error => {
        console.error('Error al obtener department:', error);
      }
    );
  }

  obtenerSucursales() {
    this.materialService.listBranchOffices().subscribe(
      (response: any[]) => {
        this.sucursales = response;
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

  confirmDelete(material: any): void {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el: ${ material.material.name }?`);
    if (confirmacion) {
      this.router.navigate(['/categories_details/' + this.materialDetails.material.category[0].id]);
      this.deleteMaterial(material.material.id);
      alert(`El material: ${material.material.name} ha sido eliminado.`);
    }
  }

  deleteMaterial(id: number): void {

    // Llamar al servicio para eliminar el material
    this.materialService.deleteMaterial(id).subscribe(
      (response) => {
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

  obtenerEmpleadoAsignado(id: number) {
    this.materialService.materialAsignado(id).subscribe(
      (response) => {
        this.asignado = response;
        console.log(this.materialDetails)
      },
      error => {
        console.error('Error al obtener la asignación:', error);
      }
    );
  }

  desasignarMaterial(employeeId: number) {
    // Lógica para desasignar el material del empleado actualmente asignado
    const materialId = this.asignado.material_id;
    // Llama al servicio para desasignar el material
    this.materialService.desasignarMaterial(materialId, employeeId).subscribe(
      (response) => {
        // Actualiza la vista después de desasignar el material
        this.obtenerEmpleadoAsignado(materialId);
        this.successMessage = response.message;
      },
      (error) => {
        console.error('Error al desasignar el material:', error);
      }
    );
  }

  asignarMaterial(employeeId: number) {
    // Lógica para asignar el material al empleado con el ID proporcionado
    const materialId = this.asignado.material_id;
    // Llama al servicio para asignar el material al empleado
    this.materialService.asignarMaterial(materialId, employeeId).subscribe(
      (response) => {
        // Actualiza la vista después de asignar el material
        this.obtenerEmpleadoAsignado(materialId);
        this.successMessage = response.message;
      },
      (error) => {
        console.error('Error al asignar el material:', error);
      }
    );
  }

  clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      //this.errorMessage = '';
    }, 2000);
  }

  getLoggedUser(): void {
    this.materialService.me().subscribe(
      (response: any) => {
        this.employeeId = response.id;
        const roleId = response.role_id;


        if (roleId === 1) {
          this.employeeRole = 'admin';
        } else if (roleId === 2){
          this.employeeRole = 'manager';
        }
      },
      error => {
        console.error('Error when obtaining data from the logged in user:', error);
      }
    );
  }

  private convertToCsv(data: any): string {
    if (!data || !data.material || !data.material.attribute || data.material.attribute.length === 0) {
      console.error('Los datos de la tabla no son válidos o están vacíos.');
      return '';
    }

    const csvRows = [];
    const headers = ['ID', 'Nombre', 'Fecha Alta', 'Fecha Baja','Atributos', 'Sucursal', 'Estado' ]; // Ajusta los encabezados
    csvRows.push(headers.join(','));

    const attributes = data.material.attribute.map((attribute: any) => `${attribute.name} - ${attribute.pivot.value}`).join('; ');


    const values = [
      data.material.id,
      this.escapeCsvValue(data.material.name),
      data.material.high_date,
      data.material.low_date ?? 'N/D',
      this.escapeCsvValue(attributes),
      this.getNombreSucursal(data.material.branch_office_id),
      data.material.state

    ];
    const csvRow = values.map(value => this.escapeCsvValue(value)).join(',');
    csvRows.push(csvRow);

    return csvRows.join('\n');
  }



  downloadCsv() {
    if (!this.materialDetails) {
      console.error('No hay datos de empleado disponibles');
      return;
    }
    const csvContent = this.convertToCsv(this.materialDetails);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${this.materialDetails.material.name}.csv`;


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
