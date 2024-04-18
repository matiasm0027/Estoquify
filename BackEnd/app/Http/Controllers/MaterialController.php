<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Material;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;


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

            // Verificar si el usuario tiene el rol permitido (por ejemplo, rol de administrador)
            $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido

            // Validar los datos de entrada del formulario
            $validator = Validator::make($request->all(), [
                'name' => 'required|string',
                'high_date' => 'required|date',
                'branch_office_id' => 'required|exists:branch_offices,id',
                'state' => 'required',
                'pivot.category_id' => 'required|exists:categories,id',
                'pivot.atributo_id' => 'required|exists:atributos,id', 
                'pivot.value' => 'required|string', 
            ]);

            // Obtener el valor "value" del objeto "pivot"
            $pivotData = $request->input('pivot');
            $value = $pivotData['value'] ?? null; // Si no se encuentra "value", se asigna null
            $category_id = $pivotData['category_id'] ?? null;
            $atributo_id = $pivotData['atributo_id'] ?? null;
            // Convertir la fecha al formato adecuado para la base de datos
            $high_date = date('Y-m-d H:i:s', strtotime($request->input('high_date')));

            // Crear una nueva instancia del material y asignar los valores
            $material = new Material();
            $material->name = $request->input('name');
            $material->high_date = $high_date;
            $material->branch_office_id = $request->input('branch_office_id');
            $material->created_at = $high_date; // Usar la fecha de alta como la fecha de creación
            $material->low_date = $request->input('low_date');
            $material->state = $request->input('state');

            // Guardar el material en la base de datos
            $material->save();

            
            $material->category()->attach($category_id, ['value' => $value], $atributo_id);

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
}
