<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use App\Models\Material;
use App\Models\AttributeCategoryMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MaterialController extends Controller
{
    public function addMaterial(Request $request)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido
            $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido

            // Validar los datos de entrada del formulario
            $validator = Validator::make($request->all(), [
                'material.name' => 'required|string',
                'material.high_date' => 'required|date',
                'material.branch_office_id' => 'required|exists:branch_offices,id',
                'material.state' => 'required',
                'material.pivot.category_id' => 'required|exists:categories,id',
                'material.pivot.attribute_id' => 'required|exists:attributes,id',
                'material.pivot.value' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            // Convertir la fecha al formato adecuado para la base de datos
            $high_date = date('Y-m-d H:i:s', strtotime($request->input('material.high_date')));

            // Crear una nueva instancia del material y asignar los valores
            $material = new Material();
            $material->name = $request->input('material.name');
            $material->high_date = $high_date;
            $material->branch_office_id = $request->input('material.branch_office_id');
            $material->state = $request->input('material.state');

            // Guardar el material en la base de datos
            $material->save();

            // Obtener los valores de los atributos y asociarlos al material
            $attribute_id = $request->input('material.pivot.attribute_id');
            $category_id = $request->input('material.pivot.category_id');
            $value = $request->input('material.pivot.value');

            $material->category()->attach($category_id, ['attribute_id' => $attribute_id, 'value' => $value]);

            // Devolver una respuesta de éxito
            return response()->json(['message' => 'Material agregado con éxito'], 201);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al agregar material: ' . $e->getMessage()], 500);
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

    public function getMaterialDetails($id)
{
    try {
        // Verificar si el usuario está autenticado
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        // Verificar si el usuario tiene el rol permitido
        $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido

        // Buscar el material por su ID
        $material = Material::with('category', 'attribute')->find($id);

        if (!$material) {
            return response()->json(['error' => 'Material no encontrado'], 404);
        }

        // Devolver los detalles del material
        return response()->json(['material' => $material], 200);
    } catch (\Exception $e) {
        // Capturar y manejar cualquier excepción que pueda ocurrir
        return response()->json(['error' => 'Error al obtener detalles del material: ' . $e->getMessage()], 500);
    }
}
}