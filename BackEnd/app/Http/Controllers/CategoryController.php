<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Material;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Exceptions\ThrottleRequestsException;


class CategoryController extends Controller
{

    public function categoryMaterialInfo()
{
    try{
    // Obtener todas las categorías con sus materiales asociados y atributos
    $categories = Category::select([
            'categories.id',
            'categories.name',
            DB::raw('(SELECT COUNT(DISTINCT(materials.id)) FROM materials 
                      JOIN attribute_category_material ON materials.id = attribute_category_material.material_id 
                      WHERE attribute_category_material.category_id = categories.id) as total_materials'),
            DB::raw('(SELECT COUNT(DISTINCT(materials.id)) FROM materials
                      JOIN attribute_category_material ON materials.id = attribute_category_material.material_id 
                      WHERE attribute_category_material.category_id = categories.id AND materials.state = "active") as active_materials'),
            DB::raw('(SELECT COUNT(DISTINCT(materials.id)) FROM materials
                      JOIN attribute_category_material ON materials.id = attribute_category_material.material_id 
                      WHERE attribute_category_material.category_id = categories.id AND materials.state = "available") as available_materials'),
            DB::raw('(SELECT COUNT(DISTINCT(materials.id)) FROM materials
                      JOIN attribute_category_material ON materials.id = attribute_category_material.material_id 
                      WHERE attribute_category_material.category_id = categories.id AND materials.state = "inactive") as inactive_materials'),
        ])
        ->get();

    return response()->json($categories);
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