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
    // Check and store the user's role
    this.userRole = this.authControlService.hasRole();

    // Subscribe to get the logged-in user's details
    this.authControlService.getLoggedUser().subscribe(
        (user) => {
            this.loggedInUser = user;
        }
    );

    // Load options such as roles, departments, and branches
    this.cargarOpciones();

    // Extract the material ID from the route parameters
    this.getMaterialIdFromRoute();

    // Fetch details of the material using the material ID
    this.getMaterialDetails();
}


initForm() {
  // Initialize form controls with default values and validators
  const formControls: { [key: string]: any } = {
    name: [this.material.name, [Validators.required, Validators.maxLength(30)]], // Material name with required and max length validators
    branch_office_id: [this.material.branch_office?.id, Validators.required], // Branch office ID with required validator
    state: [this.material.state, Validators.required], // Material state with required validator
    lowDate: [' '] // Placeholder for low date (not clear from provided context)
  };

  // If material has attributeCategoryMaterials, add form controls for each attribute
  if (this.material.attributeCategoryMaterials) {
    this.material.attributeCategoryMaterials.forEach((item, index) => {
      formControls['atributo' + index] = [item.value, [Validators.required, Validators.maxLength(50)]]; // Attribute value with required and max length validators
    });
  }

  // Create the form group with the form controls
  this.formularioMaterial = this.fb.group(formControls);
}

cargarOpciones() {
  // Load options such as branches, attributes, and departments using forkJoin to make parallel API calls
  forkJoin([
    this.authControlService.cargarSucursales(), // Load branches
    this.authControlService.cargarAtributos(), // Load attributes
    this.authControlService.cargarDepartamentos(), // Load departments
  ]).subscribe(
    ([sucursales, atributos, departamentos]) => {
      // Assign loaded options to component properties
      this.sucursales = sucursales; // Assign loaded branches
      this.atributos = atributos; // Assign loaded attributes
      this.departamentos = departamentos; // Assign loaded departments
    },
    (error) => {
      console.error('Error loading options', error); // Log any errors that occur during option loading
    }
  );
}

getMaterialIdFromRoute(): void {
  // Extract the material ID from the route parameters
  this.route.params.subscribe(params => {
    this.materialId = +params['id']; // Parse the material ID from route params to a number
  });
}


 // Retrieves material details from the API
getMaterialDetails(): void {
  this.ApiRequestService.getMaterial(this.materialId)
    .subscribe(
      (response) => {
        this.material = response;
        this.extractAttributes();
        this.cargaDatos = false; // Data loaded, set cargaDatos to false
        this.initForm(); // Initialize the form for editing
      },
      (error) => {
        this.errorMessage = error.error.error; // Handle error
      }
    );
}

// Extracts attributes from material data
extractAttributes(): void {
  if (this.material && this.material.attributeCategoryMaterials) {
    this.attriCateMatDetail = this.material.attributeCategoryMaterials;
  }
}

// Sets the current date as the low date in the form
setFechaActual(checked: boolean) {
  if (checked) {
    // Get current date and format it as yyyy-mm-dd
    const today = new Date().toISOString().slice(0, 10);
    // Set current date as low date
    this.formularioMaterial.patchValue({
      lowDate: today
    });
  }
}

// Shows the edit modal
mostrarModal() {
  this.mostrarModalEditar = true;
}

// Closes the edit modal and resets form data
cerrarModal() {
  this.mostrarModalEditar = false;
  this.getMaterialDetails(); // Refresh material details
  this.formularioMaterial.reset(); // Reset form data
}

// Edits material details
editarMaterial(): void {
  if (this.formularioMaterial.valid) {
    let bajaFecha = null;
    if (this.material.low_date !== null) {
      bajaFecha = this.material.low_date;
    } else {
      bajaFecha = this.formularioMaterial.value.lowDate;
    }

    const materialEditado: Material = {
      id: this.material.id,
      name: this.formularioMaterial.value.name,
      high_date: this.material.high_date,
      low_date: bajaFecha,
      branch_office_id: this.formularioMaterial.value.branch_office_id,
      state: this.formularioMaterial.value.state,
      attributeCategoryMaterials: []
    };

    // Add attribute values to attributeCategoryMaterials object
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

    // Send edited material data to API for update
    this.ApiRequestService.editMaterial(this.material.id, materialEditado).subscribe(
      (response: any) => {
        this.successMessage2 = response.message; // Display success message
        this.cerrarModal(); // Close the modal after successful edit
      },
      (error: any) => {
        this.errorMessage = error.error.error; // Handle error
      }
    );
  } else {
    this.errorMessage ='Invalid Form'; // Display error message for invalid form
  }
}


 // Confirms material deletion
confirmDelete(material: Material, id: number): void {
  const confirmation = confirm(`Are you sure you want to delete: ${material.name}?`);
  if (confirmation) {
    if (id === 0) {
      this.router.navigate(['/categories_view']); // Navigate to categories view if ID is 0
    } else {
      this.deleteMaterial(material.id); // Call deleteMaterial function for material deletion
    }
  }
}

// Deletes material by ID
deleteMaterial(id: number): void {
  // Call service to delete material
  this.ApiRequestService.deleteMaterial(id).subscribe(
    (response) => {
      this.router.navigate(['/categories_details/' + this.attriCateMatDetail[0].category?.id]); // Navigate to materials view after successful deletion
      alert(response.message); // Display success message
    },
    error => {
      console.error(`Error deleting material with ID ${id}:`, error); // Handle error
    }
  );
}

// Returns color based on material state
getColor(state: string | undefined): string {
  if (state === 'available') {
    return 'green'; // Green for 'available' state
  } else if (state === 'inactive') {
    return 'red'; // Red for 'inactive' state
  } else if (state === 'active') {
    return 'blue'; // Blue for 'active' state
  } else {
    return 'black'; // Default color
  }
}



 // Unassigns material from employee
desasignarMaterial(employeeId: number) {
  this.successMessage = "";
  // Logic to unassign material from currently assigned employee
  const materialId = this.material.id;
  // Calls service to unassign material
  this.ApiRequestService.desasignarMaterial(materialId, employeeId).subscribe(
    (response) => {
      // Updates view after unassigning material
      this.successMessage = response.message;
      this.getMaterialDetails();
    },
    (error) => {
      console.error('Error unassigning material:', error);
    }
  );
}

// Assigns material to employee
asignarMaterial(employeeId: number) {
  this.successMessage = "";
  // Logic to assign material to employee with provided ID
  const materialId = this.material.id;
  // Calls service to assign material to employee
  this.ApiRequestService.asignarMaterial(materialId, employeeId).subscribe(
    (response) => {
      // Updates view after assigning material
      this.successMessage = response.message;
      this.getMaterialDetails();
    },
    (error) => {
      console.error('Error assigning material:', error);
    }
  );
}

// Toggles options visibility
showOptions: boolean = false;

toggleOptions() {
  this.showOptions = !this.showOptions;
}

// Converts material data to CSV format
private convertToCsv(data: Material): string {
  if (!data || !data.attributeCategoryMaterials) {
    console.error('Table data is invalid or empty.');
    return '';
  }


  const csvRows = [];
const headers = ['ID', 'Name', 'Creation Date', 'End Date', 'Attributes', 'Branch Office', 'Status']; // Adjust headers
csvRows.push(headers.join(','));

const attributes = data.attributeCategoryMaterials?.map((attribute) => `${attribute.attribute?.name} - ${attribute.value}`).join(';\n');

const values = [
  data.id,
  this.escapeCsvValue(data.name),
  data.high_date,
  data.low_date ?? 'N/A',
  this.escapeCsvValue(attributes),
  data.branch_office?.name,
  data.state
];

const csvRow = values.map(value => this.escapeCsvValue(value)).join(',');
csvRows.push(csvRow);

return csvRows.join('\n');
}

// Downloads CSV or PDF format based on the provided format string
downloadCsvOrPdf(format: string): void {
if (format === 'csv') {
  this.downloadCsv();
} else if (format === 'pdf') {
  this.downloadPdf();
} else {
  console.error('Invalid download format.');
}
}

// Downloads PDF file
downloadPdf(): void {
if (!this.material) {
  console.error('Table data is invalid or empty.');
  return;
}

const material = this.material;
const attributes = this.material.attributeCategoryMaterials?.map((attribute) => `${attribute.attribute?.name} - ${attribute.value}`).join(';\n');

const doc = new jsPDF();

// Header
doc.text('Material Information', 10, 10);


// Material data
const materialData = [
  ['ID', 'Name', 'Creation Date', 'End Date', 'Attributes', 'Branch Office', 'Status'],
  [material.id, material.name, material.high_date, material.low_date ?? 'N/A', attributes, material.branch_office?.name, material.state]
];

if(this.material.employee_materials){
  const employee = material.employee_materials?[0] : null;
  const employeeData = [
    ['ID', 'Name', 'Last Name', 'Assignment Date', 'Return Date'],
  ];
}
// Add table to PDF
(doc as any).autoTable({
  head: materialData.slice(0, 1), // Only header row
  body: materialData.slice(1) // Rest of data rows
});

// Save the PDF
doc.save(`${material.name}.pdf`);
}




 // Function to download CSV file
downloadCsv() {
  // Check if there is employee data available
  if (!this.material.attributeCategoryMaterials) {
    // Log an error message if no employee data is available
    console.error('No employee data available');
    return;
  }
  // Convert material data to CSV format
  const csvContent = this.convertToCsv(this.material);
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv' });
  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);
  // Create a link element to download the file
  const a = document.createElement('a');
  a.href = url;
  // Set the file name for the downloaded file
  const fileName = `${this.material.name}.csv`;
  a.download = fileName;
  // Append the link to the document body
  document.body.appendChild(a);
  // Simulate a click on the link to trigger the download
  a.click();
  // Revoke the URL to release memory
  window.URL.revokeObjectURL(url);
  // Remove the link from the document body
  document.body.removeChild(a);
}

// Function to escape special characters in CSV values
private escapeCsvValue(value: any): string {
  // Check if the value is a string
  if (typeof value === 'string') {
    // Replace double quotes with two double quotes to escape them
    return `"${value.replace(/"/g, '""')}"`;
  }
  // Return the value as is if it's not a string
  return value;
}

}
