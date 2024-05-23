import { BranchOffice } from "./BranchOffice";
import { Department } from "./Department";
import { EmployeeMaterial } from "./EmployeeMaterial";
import { Role } from "./Role";

// Modelo para la tabla 'Employee'
export class Employee {
  id: number;
  name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department_id: number;
  branch_office_id: number;
  role_id: number;
  department?: Department; // Relación con la tabla 'department'
  branch_office?: BranchOffice; // Relación con la tabla 'branch_office'
  role?: Role; // Relación con la tabla 'role'
  first_login: boolean;
  fullname?: string;
  employee_materials?: EmployeeMaterial[]; // Relación con la tabla 'employee_material'

  constructor(
    id: number,
    name: string,
    last_name: string,
    email: string,
    phone_number: string,
    department_id: number,
    branch_office_id: number,
    role_id: number,
    department: Department,
    branch_office: BranchOffice,
    role: Role,
    first_login: boolean,
    employee_materials?: EmployeeMaterial[]
  ) {
    this.id = id;
    this.name = name;
    this.last_name = last_name;
    this.email = email;
    this.phone_number = phone_number;
    this.department_id = department_id;
    this.branch_office_id = branch_office_id;
    this.role_id = role_id;
    this.department = department;
    this.branch_office = branch_office;
    this.role = role;
    this.first_login = first_login;
    this.employee_materials = employee_materials;
  }
}
