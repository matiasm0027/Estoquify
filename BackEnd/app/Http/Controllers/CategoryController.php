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
                'attributeCategoryMaterials' => $category->attributeCategoryMaterials->map(function ($attributeCategoryMaterial) {
                    return [
                        'id' => $attributeCategoryMaterial->id,
                        'material_id' => $attributeCategoryMaterial->material_id,
                        'attribute_id' => $attributeCategoryMaterial->attribute_id,
                        'category_id' => $attributeCategoryMaterial->category_id,
                        'value' => $attributeCategoryMaterial->value,
                        'attribute' => [
                            'id' => $attributeCategoryMaterial->attribute->id,
                            'name' => $attributeCategoryMaterial->attribute->name,
                        ],
                        'category' => $attributeCategoryMaterial->category,
                        'material' => [
                            'id' => $attributeCategoryMaterial->material->id,
                            'name' => $attributeCategoryMaterial->material->name,
                            'low_date' => $attributeCategoryMaterial->material->low_date,
                            'high_date' => $attributeCategoryMaterial->material->high_date,
                            'state' => $attributeCategoryMaterial->material->state,
                            'branch_office_id' => $attributeCategoryMaterial->material->branch_office_id,
                            'attributes' => $attributeCategoryMaterial->material->attributeCategoryMaterials->map(function ($materialAttribute) {
                                return [
                                    'id' => $materialAttribute->attribute->id,
                                    'name' => $materialAttribute->attribute->name,
                                    'value' => $materialAttribute->value,
                                ];
                            }),
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
         // Verificar si el usuario está autenticado
         $user = $request->user();
         //dd($user->role_id);
         if (!$user) {
             return response()->json(['error' => 'Usuario no autenticado'], 401);
         }

         // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
         $this->checkUserRole(['1']);

        // Validar los datos de entrada del formulario
        $validatedData = $request->validate([
            'name' => 'required',
        ]);

            // Crear un nuevo objeto Employee y asignar los valores
            $category = new Category();
            $category->name = $validatedData['name'];
            $category->save();

            // Devolver una respuesta de éxito
            return response()->json(['message' => 'Categoria añadida con éxito'], 201);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al agregar empleado: ' . $e->getMessage()], 500);
        }
    }

    public function editCategory(Request $request, $id)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            //dd($user->role_id);
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
            $this->checkUserRole(['1']);

            // Validar los datos de entrada del formulario utilizando validate
            $validatedData = $request->validate([
                'name' => 'required',
            ]);

            // Buscar al empleado por ID
            $category = Category::find($id);

            if (!$category) {
                return response()->json(['error' => 'Categoria no encontrado'], 404);
            }

            $category->name = $validatedData['name'];
            $category->save();

            // Devolver una respuesta de éxito
            return response()->json(['message' => 'Categoria editada con éxito'], 200);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al editar empleado: ' . $e->getMessage()], 500);
        }
    }

    public function deleteCategory(Request $request, $id)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Empleado no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
            $this->checkUserRole(['1']);

            // Buscar la categoría por su ID
            $category = Category::find($id);

            // Si no se encuentra la categoría devuelve un error 404
            if (!$category) {
                return response()->json(['error' => 'Categoria no encontrada'], 404);
            }

            // Eliminar todos los materiales asociados a la categoría
            foreach ($category->material as $mate) {
                $mate->delete();
            }

            // Eliminar la categoría
            $category->delete();

            return response()->json(['message' => 'Categoria y materiales eliminados correctamente'], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function categoryInfoAssignments($id)
{
    try {
        // Buscar la categoría por su ID junto con los materiales asociados y los atributos
        $category = Category::with(['material'])->find($id);

        if (!$category) {
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }

        foreach ($category->material as $material) {
            // Verificar si el material no tiene un registro en la tabla pivot employee_material
            $employeeMaterial = EmployeeMaterial::where('material_id', $material->id)->first();
            if (!$employeeMaterial && $material->state == 'active' && $material->low_date === null) {
                // Cambiar el estado del material a "disponible"
                $material->state = 'available';
                $material->save();
            } else if ($employeeMaterial && $material->state == 'available') {
                $material->state = 'active';
                $material->save();
            } else if ($material->low_date !== null) {
                $material->state = 'inactive';
                $material->save();
            }
        }

        $materials = [];
        $uniqueMaterials = $category->material->unique('id');
        foreach ($uniqueMaterials as $material) {
            $materialData = [
                'id' => $material->id,
                'name' => $material->name,
                'low_date' => $material->low_date,
                'high_date' => $material->high_date,
                'state' => $material->state,
                'branch_office_id' => $material->branch_office_id,
            ];
            $materials[] = $materialData;
        }
        return response()->json($materials);
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
