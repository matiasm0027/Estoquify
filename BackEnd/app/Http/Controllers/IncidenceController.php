<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Incidence;
use Illuminate\Support\Facades\Validator;
use App\Models\Category;
use App\Models\CategoryIncidence;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Exceptions\ThrottleRequestsException;


class IncidenceController extends Controller{

    public function addIncidence(Request $request)
    {
        // Define las reglas de validación
        $rules = [
            'date' => 'required|date',
            'petition' => 'required|string',
            'priority' => 'required|string',
            'type' => 'required|string',
            'employee_id' => 'required|exists:employees,id',
        ];

        // Si el tipo de reporte es "Solicitud Material", requerir la presencia de categorías
        if ($request->input('type') === 'Solicitud Material') {
            $rules['categories'] = 'required|array';
            $rules['categories.*.id'] = 'required|exists:categories,id'; // Asegúrate de que cada categoría exista
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), $rules);

        // Comprobar si hay errores de validación
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Datos de la incidencia
        $incidenceData = [
            'date' => $request->date,
            'petition' => $request->petition,
            'priority' => $request->priority,
            'state' => 'pending',
            'type' => $request->type,
            'employee_id' => $request->employee_id,
        ];

        // Crear y guardar la incidencia
        $incidence = Incidence::create($incidenceData);

        // Si el tipo de incidencia es "Solicitud Material", asociar las categorías
        if ($request->type === 'Solicitud Material') {
            $categories = $request->input('categories');
            foreach ($categories as $category) {
                $incidence->categoryIncidences()->create([
                    'category_id' => $category['id'],
                    'incidence_id' => $incidence->id
                ]);
            }
        }

        // Mensaje de que se ha generado correctamente la incidencia
        return response()->json(['message' => 'Reporte generado correctamente'], 201);
    }
   

    public function listIncidences()
    {
        try{
        $incidences = Incidence::with('employee.branchOffice')
        ->orderBy('id')
        ->get();
        return response()->json($incidences);
    } catch (ThrottleRequestsException $e) {
        return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
    }
    }

    public function changeIncidenceStatus(Request $request, $id)
{
    try {
        // Verifica si el usuario está autenticado
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        // Verifica si el usuario tiene el rol permitido
        $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido

        // Encuentra el reporte por su ID
        $incidence = Incidence::find($id);

        // Verifica si se encontró el reporte
        if (!$incidence) {
            return response()->json(['message' => 'El reporte no fue encontrado'], 404);
        }

        // Valida el estado proporcionado en la solicitud
        $request->validate([
            'estado' => 'required|in:accepted,rejected,pending' // Asegúrate de incluir todos los posibles estados aquí
        ]);

        // Actualiza el estado del reporte
        $incidence->state = $request->estado;
        $incidence->save();

        // Devuelve una respuesta exitosa
        return response()->json(['message' => 'Estado del reporte actualizado correctamente'], 200);
    } catch (\Exception $e) {
        // Captura y maneja cualquier excepción que pueda ocurrir
        return response()->json(['error' => 'Error al cambiar el estado del reporte: ' . $e->getMessage()], 500);
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
