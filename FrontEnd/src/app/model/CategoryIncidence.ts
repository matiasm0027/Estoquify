import { Category } from "./Category";
import { Incidence } from "./Incidence";

export class CategoryIncidence {
    id: number;
    category_id: number;
    incidence_id: number;
    category?: Category; // Relación con la tabla 'categories'
    incidence?: Incidence; // Relación con la tabla 'incidences'
  
    constructor(id: number, category_id: number, incidence_id: number, category?: Category, incidence?: Incidence) {
      this.id = id;
      this.category_id = category_id;
      this.incidence_id = incidence_id;
      this.category = category;
      this.incidence = incidence;
    }
  }