<?php


namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Material;

class EmployeeMaterialController extends Controller
{

    public function employeeInfoAssignments($id)
    {
        // Obtener el empleado específico con los materiales asignados activos
        $employee = Employee::with(['role', 'department', 'branchOffice', 'material' => function ($query) {
        }])->find($id);

        if (!$employee) {
            return response()->json(['message' => 'Empleado no encontrado'], 404);
        }

        $assignments = [
            'employee_id' => $employee->id,
            'name' => $employee->name,
            'last_name' => $employee->last_name,
            'email' => $employee->email,
            'phone_number' => $employee->phone_number,
            'role' => $employee->role ? $employee->role->name : null,
            'department' => $employee->department ? $employee->department->name : null,
            'branch_office' => $employee->branchOffice ? $employee->branchOffice->name : null,
            'materials' => $employee->material->map(function ($material){
            $material->wherePivot('state', 'active'); 
            $categoryName = $material->category->first()->name ?? null;
                return [
                    'category_name' => $categoryName,
                    'material_id' => $material->id,
                    'material_name' => $material->name,
                ];
            }),
        ];
        return response()->json($assignments);
    }
}

