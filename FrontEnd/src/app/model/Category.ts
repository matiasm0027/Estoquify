import { AttributeCategoryMaterial } from "./AttributeCategoryMaterial";

// Modelo para la tabla 'Category'
export class Category {
  id: number;
  name: string;
  attributeCategoryMaterials?: AttributeCategoryMaterial[]; // Relación con la tabla 'attribute_category_material'
  constructor(id: number, name: string, attributeCategoryMaterials?: AttributeCategoryMaterial[]) {
    this.id = id;
    this.name = name;
    this.attributeCategoryMaterials = attributeCategoryMaterials;
  }
}
