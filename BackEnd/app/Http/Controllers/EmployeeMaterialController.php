<?php


namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Auth;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Material;
use App\Models\MaterialAssignmentHistory;
use Illuminate\Http\Exceptions\ThrottleRequestsException;


class EmployeeMaterialController extends Controller
{

    public function employeeInfoAssignments($id)
    {
        try{
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
    } catch (ThrottleRequestsException $e) {
        return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
    }
    }

    public function materialAssignedEmployees($materialId)
    {
        try{
        // Obtener el material específico con los empleados asignados activos
        $material = Material::with('employee')->find($materialId);

        if (!$material) {
            return response()->json(['message' => 'Material no encontrado'], 404);
        }

        $assignedEmployees = [
            'material_id' => $material->id,
            'material_name' => $material->name,
            'category_name' => $material->category->isNotEmpty() ? $material->category->first()->name : null,
            $category_id = $material->category->isNotEmpty() ? $material->category->first()->id : null,
            'assigned_employees' => $material->employee->isEmpty() ? 
                $this->getAllEmployeesInBranch($material->branch_office_id, $category_id) :
                $material->employee->map(function ($employee) {
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
        } catch (ThrottleRequestsException $e) {
            return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
        }
    }

    private function getAllEmployeesInBranch($branchOfficeId, $categoryId)
{
    // Obtener los IDs de empleados que tienen al menos un material asignado con la categoría deseada
    $assignedEmployeeIds = Employee::whereDoesntHave('material', function ($query) use ($categoryId) {
        $query->whereHas('category', function ($subquery) use ($categoryId) {
            $subquery->where('category_id', $categoryId);
        });
    })
    ->pluck('id')
    ->toArray();


    // Obtener todos los empleados en la sucursal especificada
    
    $allEmployees = Employee::whereIn('id', $assignedEmployeeIds) // Filtrar por IDs de empleados
    ->where('branch_office_id', $branchOfficeId) // Filtrar por ID de sucursal
    ->get();

    // Mapear los empleados filtrados a un formato adecuado para respuesta
    $filteredEmployeesFormatted = $allEmployees->map(function ($employee) {
        return [
            'employee_id' => $employee->id,
            'name' => $employee->name,
            'last_name' => $employee->last_name,
            'email' => $employee->email,
            'assignment_date' => null,
            'return_date' => null,
        ];
    });

    return $filteredEmployeesFormatted;
}



    public function asignarMaterial(Request $request, $materialId)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }
    
            // Verificar si el usuario tiene el rol permitido
            $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido
            // Validar el ID del empleado
            $employeeId = $request->input('employee_id');
            $employee = Employee::find($employeeId);

            if (!$employee) {
                return response()->json(['message' => "Empleado no encontrado: $request"], 404);
            }

            // Encuentra el material por su ID
            $material = Material::find($materialId);

            if (!$material) {
                return response()->json(['message' => 'Material no encontrado'], 404);
            }

            // Crear una nueva entrada en la tabla pivot
            $assignmentDate = date('Y-m-d H:i:s'); // Fecha actual como fecha de asignación
            $material->employee()->attach($employeeId, ['assignment_date' => $assignmentDate]);

            return response()->json(['message' => 'Material asignado correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al asignar material: ' . $e->getMessage()], 500);
        }
    }

    public function desasignarMaterial(Request $request, $materialId)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }
    
            // Verificar si el usuario tiene el rol permitido
            $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido
            // Validar el ID del empleado
            $employeeId = $request->input('employee_id');
            $employee = Employee::find($employeeId);

            if (!$employee) {
                return response()->json(['message' => 'Empleado no encontrado'], 404);
            }

            // Encuentra el material por su ID
            $material = Material::find($materialId);

            if (!$material) {
                return response()->json(['message' => 'Material no encontrado'], 404);
            }

            // Verificar si hay empleados asignados a este material
            if ($material->employee->isEmpty()) {
                return response()->json(['message' => 'No hay empleados asignados a este material'], 200);
            }

            // Registrar la desasignación en material_assignments_history
            $assignmentDate = $material->employee()->where('employee_id', $employeeId)->first()->pivot->assignment_date;
            $desassignmentDate = date('Y-m-d H:i:s');

            MaterialAssignmentHistory::create([
                'employee_id' => $employeeId,
                'material_id' => $materialId,
                'assignment_date' => $assignmentDate,
                'return_date' => $desassignmentDate,
            ]);

            // Desasignar el material (eliminar la relación con el empleado)
            $material->employee()->detach($employeeId);

            return response()->json(['message' => 'Material desasignado correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al desasignar material: ' . $e->getMessage()], 500);
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