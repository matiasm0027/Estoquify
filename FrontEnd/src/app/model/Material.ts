import { AttributeCategoryMaterial } from "./AttributeCategoryMaterial";
import { BranchOffice } from "./BranchOffice";
import { EmployeeMaterial } from "./EmployeeMaterial";

export class Material {
  id: number;
  name: string;
  low_date: Date;
  high_date: Date;
  state: string;
  branch_office_id: number;
  branch_office?: BranchOffice; // Relación con la tabla 'branch_office'
  attributeCategoryMaterials?: AttributeCategoryMaterial[]; // Relación con la tabla 'attribute_category_material'
  employee_materials?: EmployeeMaterial[]; // Relación con la tabla 'employee_material'

  constructor(
    id: number,
    name: string,
    low_date: Date,
    high_date: Date,
    state: string,
    branch_office_id: number,
    branch_office?: BranchOffice,
    attributeCategoryMaterials?: AttributeCategoryMaterial[],
    employee_materials?: EmployeeMaterial[]
  ) {
    this.id = id;
    this.name = name;
    this.low_date = low_date;
    this.high_date = high_date;
    this.state = state;
    this.branch_office_id = branch_office_id;
    this.branch_office = branch_office;
    this.attributeCategoryMaterials = attributeCategoryMaterials;
    this.employee_materials = employee_materials;
  }
}
