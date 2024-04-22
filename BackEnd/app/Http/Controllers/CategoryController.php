<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Material;
use Illuminate\Support\Facades\Auth;


class CategoryController extends Controller
{

    public function categoryMaterialInfo()
    {
        // Obtener todas las categorías con sus materiales asociados y atributos
        $categories = Category::with('material')
            ->withCount([
                'material as total_materials',
                'material as active_materials' => function ($query) {
                    $query->where('state', 'active');
                },
                'material as available_materials' => function ($query) {
                    $query->where('state', 'available');
                },
                'material as inactive_materials' => function ($query) {
                    $query->where('state', 'inactive');
                }
            ])
            ->get();

        // Transformar la estructura de datos para el resultado final
        $categoryMaterialInfo = [];

        foreach ($categories as $category) {
            $categoryInfo = [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'total_materials' => $category->total_materials,
                'active_materials' => $category->active_materials,
                'available_materials' => $category->available_materials,
                'inactive_materials' => $category->inactive_materials,
            ];

            $categoryMaterialInfo[] = $categoryInfo;
        }

        return response()->json($categoryMaterialInfo);
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
            //dd($user->role_id);
            if (!$user) {
                return response()->json(['error' => 'Empleado no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
            $this->checkUserRole(['1']);

            // Buscar al usuario por su ID
            $category = Category::find($id);

            // Si no se encuentra al usuario devuelve un error 404
            if (!$category) {
                return response()->json(['error' => 'Categoria no encontrada'], 404);
            }

            // Eliminar al usuario
            $category->delete();

            return response()->json(['message' => 'Categoria eliminada correctamente'], 200);

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