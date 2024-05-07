export interface Employee {
  id: number;
  name: string;
  last_name: string;
  email: string;
  department: string | null;
  branch_office: string | null;
  fullname?: string; 
}
