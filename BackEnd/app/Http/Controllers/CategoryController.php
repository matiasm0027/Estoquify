<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Material;
use App\Models\EmployeeMaterial;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Exceptions\ThrottleRequestsException;


class CategoryController extends Controller
{

    public function categoryMaterialInfo()
    {
        try {
            // Obtener todas las categorías con sus materiales y atributos
            $categories = Category::with(['attributeCategoryMaterials.attribute', 'attributeCategoryMaterials.material.branchOffice'])->get();

            $result = $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'attributeCategoryMaterials' => $category->attributeCategoryMaterials->unique('material_id')->map(function ($attributeCategoryMaterial) {
                        return [
                            'id' => $attributeCategoryMaterial->id,
                            'material_id' => $attributeCategoryMaterial->material_id,
                            'attribute_id' => $attributeCategoryMaterial->attribute_id,
                            'category_id' => $attributeCategoryMaterial->category_id,
                            'value' => $attributeCategoryMaterial->value,
                            'material' => [
                                'id' => $attributeCategoryMaterial->material->id,
                                'name' => $attributeCategoryMaterial->material->name,
                                'low_date' => $attributeCategoryMaterial->material->low_date,
                                'high_date' => $attributeCategoryMaterial->material->high_date,
                                'state' => $attributeCategoryMaterial->material->state,
                                'branch_office' => $attributeCategoryMaterial->material->branchOffice,
                                'attributeCategoryMaterials' => [
                                    'attributes' => $attributeCategoryMaterial->material->attributeCategoryMaterials->map(function ($materialAttribute) {
                                        return [
                                            'id' => $materialAttribute->attribute->id,
                                            'name' => $materialAttribute->attribute->name,
                                            'value' => $materialAttribute->value,
                                        ];
                                    }),
                                ]
                            ],
                        ];
                    }),
                ];
            });

            return response()->json($result);
        } catch (ThrottleRequestsException $e) {
            return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
        }
    }

    public function addCategory(Request $request)
    {
        try {
        $user = $request->user();
         if (!$user) {
             return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $this->checkUserRole(['1']);

        $validatedData = $request->validate([
            'name' => 'required',
        ]);

            $category = new Category();
            $category->name = $validatedData['name'];
            $category->save();

            return response()->json(['message' => 'Categoria añadida con éxito'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al agregar empleado: ' . $e->getMessage()], 500);
        }
    }

    public function editCategory(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $this->checkUserRole(['1']);

            $validatedData = $request->validate([
                'name' => 'required',
            ]);

            $category = Category::find($id);

            if (!$category) {
                return response()->json(['error' => 'Categoria no encontrado'], 404);
            }

            $category->name = $validatedData['name'];
            $category->save();

            return response()->json(['message' => 'Categoria editada con éxito'], 200);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al editar empleado: ' . $e->getMessage()], 500);
        }
    }

    public function deleteCategory(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Empleado no autenticado'], 401);
            }

            $this->checkUserRole(['1']);

            $category = Category::find($id);
            if (!$category) {
                return response()->json(['error' => 'Categoria no encontrada'], 404);
            }

            foreach ($category->attributeCategoryMaterials as $attributeCategoryMaterial) {
                $attributeCategoryMaterial->material->delete();
            }

            $category->attributeCategoryMaterials()->delete();
            $category->delete();

            return response()->json(['message' => 'Categoria y materiales eliminados correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function categoryInfoAssignments($id)
    {
        try {
            $category = Category::with(['attributeCategoryMaterials.attribute', 'attributeCategoryMaterials.material.branchOffice'])->find($id);

            $result = [
                'id' => $category->id,
                'name' => $category->name,
                'attributeCategoryMaterials' => $category->attributeCategoryMaterials->unique('material_id')->map(function ($attributeCategoryMaterial) {
                    // Obtener el material asociado
                    $material = $attributeCategoryMaterial->material;

                    // Verificar si hay EmployeeMaterial para el material actual
                    $employeeMaterial = EmployeeMaterial::where('material_id', $material->id)->first();

                    // Actualizar el estado del material según la lógica proporcionada
                    if (!$employeeMaterial && $material->state == 'active' && $material->low_date === null) {
                        $material->state = 'available';
                    } else if ($employeeMaterial && $material->state == 'available') {
                        $material->state = 'active';
                    } else if ($material->low_date !== null) {
                        $material->state = 'inactive';
                    }

                    // Guardar los cambios en el material
                    $material->save();

                    return [
                        'id' => $attributeCategoryMaterial->id,
                        'material_id' => $attributeCategoryMaterial->material_id,
                        'attribute_id' => $attributeCategoryMaterial->attribute_id,
                        'category_id' => $attributeCategoryMaterial->category_id,
                        'value' => $attributeCategoryMaterial->value,
                        'material' => [
                            'id' => $material->id,
                            'name' => $material->name,
                            'low_date' => $material->low_date,
                            'high_date' => $material->high_date,
                            'state' => $material->state,
                            'branch_office' => $material->branchOffice,
                            'attributeCategoryMaterials' => [
                                'attributes' => $material->attributeCategoryMaterials->map(function ($materialAttribute) {
                                    return [
                                        'id' => $materialAttribute->attribute->id,
                                        'name' => $materialAttribute->attribute->name,
                                        'value' => $materialAttribute->value,
                                    ];
                                }),
                            ]
                        ],
                    ];
                }),
            ];

            return response()->json($result);

        } catch (ThrottleRequestsException $e) {
            return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
        }
    }


    protected function checkUserRole($allowedRoles)
    {
        if (!Auth::check()) {
            // El usuario no está autenticado
            abort(401, 'Unauthorized');
        }

        $user = Auth::user();

        if (!in_array($user->role_id, $allowedRoles)) {
            // El usuario no tiene uno de los roles permitidos
            abort(403, 'Access denied');
        }
    }
}
