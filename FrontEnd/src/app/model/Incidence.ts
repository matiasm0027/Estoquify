import { Category } from "./Category";
import { Employee } from "./Employee";

// Modelo para la tabla 'Incidence'
export class Incidence {
  id: number;
  date: string;
  petition: string;
  state: string;
  priority: string;
  type: string;
  employee_id: number;
  employee?: Employee;
  categories?: Category[]; // Relación con la tabla 'categories'
  updated_at?:Date;
  constructor(id: number, date: string, petition: string, state: string, priority: string, type: string, employee_id: number, categories?: Category[],  employee?: Employee) {
    this.id = id;
    this.date = date;
    this.petition = petition;
    this.state = state;
    this.priority = priority;
    this.type = type;
    this.employee_id = employee_id;
    this.categories = categories;
    this.employee = employee;
  }
}
