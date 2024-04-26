import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosControlService } from 'src/app/services/usuarios/usuarios-control.service';

@Component({
  selector: 'app-material-details',
  templateUrl: './material-details.component.html',
  styleUrls: ['./material-details.component.css']
})
export class MaterialDetailsComponent implements OnInit {
  materialId!: number;
  materialDetails: any = {};
  sidebarVisible: boolean = true;
  sidebarWidth: number = 250;
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
    this.obtenerEmpleadoAsignado(this.materialId);
  }

  getCategoriaID(){
    this.categoria_id = this.controlUsuario.getNumero();
  }

  initForm() {
    const formControls: { [key: string]: any } = {
        nombre: [this.materialDetails.material.name, Validators.required],
        valor: [this.materialDetails.material.attribute[0].pivot.value, Validators.required],
        sucursal: [this.materialDetails.material.branch_office_id, Validators.required],
        estado: [this.materialDetails.material.state, Validators.required],
        lowDate: [' ']
    };

    this.materialDetails.material.attribute.forEach((attribute: any, index: number) => {
        formControls['atributo' + index] = [attribute.pivot.value, Validators.required];
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

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarWidth = this.sidebarVisible ? 250 : 0;
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
        this.clearMessagesAfterDelay();
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
        this.clearMessagesAfterDelay();
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
}
