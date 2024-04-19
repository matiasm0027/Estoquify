import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(
    private route: ActivatedRoute,
    private materialService: ApiRequestService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getMaterialIdFromRoute();
    this.obtenerDepartamento();
    this.obtenerSucursales();
    this.getMaterialDetails();
    this.initForm();
  }

  initForm() {
    this.formularioMaterial = this.fb.group({
      nombre: ['', Validators.required],
      fechaAlta: ['', Validators.required],
      fechaBaja: [''],
      valor: ['', Validators.required],
      sucursal: ['', Validators.required],
      estado: ['', Validators.required]
    });
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

  getMaterialDetails(): void {
    this.materialService.getMaterialDetails(this.materialId)
      .subscribe(
        (material: any) => {
          this.materialDetails = material;
          console.log(this.materialDetails)
        },
        (error: any) => {
          console.error('Error al obtener detalles del material:', error);
        }
      );
  }

  volver() {
    this.router.navigate(['/materials_view']);
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
      const materialEditado = {
        id: this.materialId,
        nombre: this.formularioMaterial.value.nombre,
        fechaAlta: this.formularioMaterial.value.fechaAlta,
        fechaBaja: this.formularioMaterial.value.fechaBaja,
        valor: this.formularioMaterial.value.valor,
        sucursal: this.formularioMaterial.value.sucursal,
        estado: this.formularioMaterial.value.estado
      };

      this.materialService.editMaterial(this.materialId, materialEditado).subscribe(
        (response: any) => {
          console.log('Material editado correctamente', response);
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

  confirmDelete(material: any): void {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el material ${material.name}?`);
    if (confirmacion) {
      this.router.navigate(['/materials_view']); 
      this.deleteMaterial(material.id);
      alert(`El material ${material.name} ha sido eliminado.`);
    }
  }

  deleteMaterial(id: number): void {
    console.log('ID del material a eliminar:', id);

    // Llamar al servicio para eliminar el material
    this.materialService.deleteMaterial(id).subscribe(
      (response) => {
        console.log('Material eliminado correctamente', response);
        // Navegar a la vista de materiales después de eliminar con éxito
      },
      error => {
        console.error(`Error al eliminar material con ID ${id}:`, error);
        // Manejar errores en caso de que la eliminación falle
      }
    );
  }
}
