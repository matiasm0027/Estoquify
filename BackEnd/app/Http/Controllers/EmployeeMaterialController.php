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
            'role_id' => $employee->role ? $employee->role->id : null,
            'department_id' => $employee->department ? $employee->department->id : null,
            'branch_office_id' => $employee->branchOffice ? $employee->branchOffice->id : null,
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

    public function materialAssignedEmployees($materialId)
{
    // Obtener el material específico con los empleados asignados activos
    $material = Material::with('employee')->find($materialId);

    if (!$material) {
        return response()->json(['message' => 'Material no encontrado'], 404);
    }

    if ($material->employee->isEmpty()) {
        // Si no hay empleados asignados al material, obtener todos los empleados de la misma sucursal
        $branchOfficeId = $material->branch_office_id;

        $allEmployees = Employee::where('branch_office_id', $branchOfficeId)
            ->get();

        if ($allEmployees->isEmpty()) {
            return response()->json(['message' => 'No hay empleados asignados a este material ni en la sucursal'], 200);
        }

        $assignedEmployees = [
            'material_id' => $material->id,
            'material_name' => $material->name,
            'category_name' => $material->category->first()->name ?? null,
            'assigned_employees' => $allEmployees->map(function ($employee) {
                return [
                    'employee_id' => $employee->id,
                    'name' => $employee->name,
                    'last_name' => $employee->last_name,
                    'email' => $employee->email,
                    // No hay fecha de asignación o devolución en este contexto
                    'assignment_date' => null,
                    'return_date' => null,
                ];
            }),
        ];

        return response()->json($assignedEmployees, 200);
    }

    // Si hay empleados asignados, devolver la información de los empleados asignados
    $assignedEmployees = [
        'material_id' => $material->id,
        'material_name' => $material->name,
        'category_name' => $material->category->first()->name ?? null,
        'assigned_employees' => $material->employee->map(function ($employee) {
            return [
                'employee_id' => $employee->id,
                'name' => $employee->name,
                'last_name' => $employee->last_name,
                'email' => $employee->email,
                'assignment_date' => $employee->pivot->assignment_date,
                'return_date' => $employee->pivot->return_date,
            ];
        }),
    ];

    return response()->json($assignedEmployees, 200);
}

}