import { Employee } from "./Employee";
import { Material } from "./Material";

export class EmployeeMaterial {
  id: number;
  employee_id: number;
  material_id: number;
  assignment_date: Date;
  return_date: Date;
  employee?: Employee; // Relación con la tabla 'employee'
  material?: Material; // Relación con la tabla 'material'

  constructor(
    id: number,
    employee_id: number,
    material_id: number,
    assignment_date: Date,
    return_date: Date,
    employee?: Employee,
    material?: Material
  ) {
    this.id = id;
    this.employee_id = employee_id;
    this.material_id = material_id;
    this.assignment_date = assignment_date;
    this.return_date = return_date;
    this.employee = employee;
    this.material = material;
  }
}
