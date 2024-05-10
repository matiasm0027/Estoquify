// employee.model.ts
export class Employee {
  id: number;
  name: string;
  last_name: string;
  department: string;
  branch_office: string;
  email: string;


  fullname?: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.last_name = data.lastName;
    this.department = data.department;
    this.branch_office = data.branchOffice;
    this.email = data.email;
  }

}
