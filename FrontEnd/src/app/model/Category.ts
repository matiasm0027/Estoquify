import { AttributeCategoryMaterial } from "./AttributeCategoryMaterial";
import { CategoryIncidence } from "./CategoryIncidence";

// Modelo para la tabla 'Category'
export class Category {
  id: number;
  name: string;
  attributeCategoryMaterials?: AttributeCategoryMaterial[]; // Relación con la tabla 'attribute_category_material'
  categoryIncidences?: CategoryIncidence[]; // Relación con la tabla 'category_incidences'

  constructor(id: number, name: string, attributeCategoryMaterials?: AttributeCategoryMaterial[], categoryIncidences?: CategoryIncidence[]) {
    this.id = id;
    this.name = name;
    this.attributeCategoryMaterials = attributeCategoryMaterials;
    this.categoryIncidences = categoryIncidences;
  }
}
