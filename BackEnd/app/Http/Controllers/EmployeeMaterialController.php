<?php


namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Material;

class EmployeeMaterialController extends Controller
{

    public function listAssignments($id)
    {
        // Obtener el empleado específico con los materiales asignados activos
        $employee = Employee::with(['material' => function ($query) {
             // Filtrar por estado 'active'
        }])->find($id);

        if (!$employee) {
            return response()->json(['message' => 'Empleado no encontrado'], 404);
        }

        $assignments = [
            'employee_id' => $employee->id,
            'employee_name' => $employee->name,
            'materials' => $employee->material->map(function ($material){
            $material->wherePivot('state', 'active'); 
                return [
                    'material_id' => $material->id,
                ];
            }),
        ];

        return response()->json($assignments);
    }
}

