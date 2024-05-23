export class BranchOffice {
  id: number;
  name: string;
  itsCentral: boolean;

  constructor(id: number, name: string, itsCentral: boolean) {
    this.id = id;
    this.name = name;
    this.itsCentral = itsCentral;
  }
}
