import { Attribute } from './Attribute';
import { BranchOffice } from "./BranchOffice";
import { Category } from './Category';
import { Employee } from "./Employee";

export interface Material {
  id: number;
  name: string;
  low_date?: Date;
  high_date: Date;
  state: string;
  branch_office_id: number;
  branch_office?: BranchOffice;
  pivot: {
    employee_id: number;
    material_id: number;
    assignment_date: string;
    return_date: string | null;
  };
  category: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      material_id: number;
      category_id: number;
      value: string;
    };
  }[];
  employees?: Employee[];
  attributes?: Attribute[];
  categories?: Category[];
}
