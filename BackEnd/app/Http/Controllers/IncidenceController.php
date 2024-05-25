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
        // Define the validation rules
        $rules = [
            'date' => 'required|date',
            'petition' => 'required|string',
            'priority' => 'required|string',
            'type' => 'required|string',
            'employee_id' => 'required|exists:employees,id',
        ];
    
        // If the report type is "Material Request", require the presence of categories
        if ($request->input('type') === 'Material Request') {
            $rules['categories'] = 'required|array';
            $rules['categories.*.id'] = 'required|exists:categories,id'; // Ensure each category exists
        }
    
        // Validate the request
        $validator = Validator::make($request->all(), $rules);
    
        // Check for validation errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        // Incidence data
        $incidenceData = [
            'date' => $request->date,
            'petition' => $request->petition,
            'priority' => $request->priority,
            'state' => 'pending',
            'type' => $request->type,
            'employee_id' => $request->employee_id,
        ];
    
        // Create and save the incidence
        $incidence = Incidence::create($incidenceData);
    
        // If the incidence type is "Material Request", associate the categories
        if ($request->type === 'Material Request') {
            $categories = $request->input('categories');
            foreach ($categories as $category) {
                $incidence->categoryIncidences()->create([
                    'category_id' => $category['id'],
                    'incidence_id' => $incidence->id
                ]);
            }
        }
    
        // Success message for generating the incidence
        return response()->json(['message' => 'Report generated successfully'], 201);
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
            // Verify if the user is authenticated
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }
    
            // Verify if the user has the allowed role
            $this->checkUserRole(['1']); // Change '1' with the allowed role ID
    
            // Find the incidence by its ID
            $incidence = Incidence::find($id);
    
            // Check if the incidence was found
            if (!$incidence) {
                return response()->json(['message' => 'El reporte no fue encontrado'], 404);
            }
    
            // Validate the state provided in the request
            $request->validate([
                'estado' => 'required|in:accepted,rejected,pending' // Make sure to include all possible states here
            ]);
    
            // Update the state of the incidence
            $incidence->state = $request->estado;
            $incidence->save();
    
            // Return a successful response
            return response()->json(['message' => 'Estado del reporte actualizado correctamente'], 200);
        } catch (\Exception $e) {
            // Catch and handle any exceptions that may occur
            return response()->json(['error' => 'Error al cambiar el estado del reporte: ' . $e->getMessage()], 500);
        }
    }

    protected function checkUserRole($allowedRoles)
    {
        if (!Auth::check()) {
            // The user is not authenticated
            abort(401, 'Unauthorized');
        }
    
        $user = Auth::user();
    
        if (!in_array($user->role_id, $allowedRoles)) {
            // The user does not have one of the allowed roles
            abort(403, 'Access denied');
        }
    }
}
