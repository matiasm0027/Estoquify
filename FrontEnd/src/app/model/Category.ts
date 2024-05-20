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

// try {
//   $employee = Employee::with([
//       'role',
//       'department',
//       'branchOffice',
//       'employeeMaterials.material.attributeCategoryMaterials' => function ($query) {
//           $query->with('attribute', 'category');
//       }
//   ])->findOrFail($id);

  // Construir la respuesta
  // $response = [
  //     'id' => $employee->id,
  //     'name' => $employee->name,
  //     'last_name' => $employee->last_name,
  //     'email' => $employee->email,
  //     'phone_number' => $employee->phone_number,
  //     'role' => $employee->role,
  //     'department' => $employee->department,
  //     'branch_office' => $employee->branchOffice,
  //     'employee_materials' => $employee->employeeMaterials->map(function ($employeeMaterial) {
  //         return [
  //             'id' => $employeeMaterial->id,
  //             'employee_id' => $employeeMaterial->employee_id,
  //             'material_id' => $employeeMaterial->material_id,
  //             'assignment_date' => $employeeMaterial->assignment_date,
  //             'return_date' => $employeeMaterial->return_date,
  //             'material' => [
  //                 'id' => $employeeMaterial->material->id,
  //                 'name' => $employeeMaterial->material->name,
  //                 'attributeCategoryMaterials' => $employeeMaterial->material->attributeCategoryMaterials->map(function ($attributeCategoryMaterial) {
  //                     return [
  //                         'id' => $attributeCategoryMaterial->id,
  //                         'material_id' => $attributeCategoryMaterial->material_id,
  //                         'attribute_id' => $attributeCategoryMaterial->attribute_id,
  //                         'category_id' => $attributeCategoryMaterial->category_id,
  //                         'value' => $attributeCategoryMaterial->value,
  //                         'attribute' => $attributeCategoryMaterial->attribute,
  //                         'category' => $attributeCategoryMaterial->category
  //                     ];
  //                 })
  //             ]
  //         ];
  //     })
  // ];
