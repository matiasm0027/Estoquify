import { Attribute } from "./Attribute";
import { Category } from "./Category";
import { Material } from "./Material";

export class AttributeCategoryMaterial {
  id: number;
  material_id: number;
  attribute_id: number;
  category_id: number;
  value: string;
  material?: Material; // Relación con la tabla 'material'
  attribute?: Attribute; // Relación con la tabla 'attribute'
  category?: Category; // Relación con la tabla 'category'
  
  constructor(
    id: number,
    material_id: number,
    attribute_id: number,
    category_id: number,
    value: string,
    material?: Material,
    attribute?: Attribute,
    category?: Category
  ) {
    this.id = id;
    this.material_id = material_id;
    this.attribute_id = attribute_id;
    this.category_id = category_id;
    this.value = value;
    this.material = material;
    this.attribute = attribute;
    this.category = category;
  }
}
