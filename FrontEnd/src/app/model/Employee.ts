import { BranchOffice } from "./BranchOffice";
import { Department } from "./Department";
import { Material } from "./Material";
import { Role } from "./Role";

export interface Employee {
  id: number;
  name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password:string;
  department_id: number;
  role_id: number;
  branch_office_id: number;
  department?: Department;
  role?: Role;
  branch_office?: BranchOffice;
  material?: Material;
  fullname?: string;
}
