<?php


namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Auth;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Material;
use App\Models\MaterialAssignmentHistory;
use App\Models\EmployeeMaterial;
use Illuminate\Http\Exceptions\ThrottleRequestsException;


class EmployeeMaterialController extends Controller
{

    public function getEmployee($id)
    {
        try {
            $employee = Employee::with([
                'role',
                'department',
                'branchOffice',
                'employeeMaterials.material.attributeCategoryMaterials' => function ($query) {
                    $query->with('attribute', 'category');
                }
            ])->findOrFail($id);

            // Construir la respuesta
            $response = [
                'id' => $employee->id,
                'name' => $employee->name,
                'last_name' => $employee->last_name,
                'email' => $employee->email,
                'phone_number' => $employee->phone_number,
                'role' => $employee->role,
                'department' => $employee->department,
                'branch_office' => $employee->branchOffice,
                'employee_materials' => $employee->employeeMaterials->map(function ($employeeMaterial) {
                    return [
                        'id' => $employeeMaterial->id,
                        'employee_id' => $employeeMaterial->employee_id,
                        'material_id' => $employeeMaterial->material_id,
                        'assignment_date' => $employeeMaterial->assignment_date,
                        'return_date' => $employeeMaterial->return_date,
                        'material' => [
                            'id' => $employeeMaterial->material->id,
                            'name' => $employeeMaterial->material->name,
                            'attributeCategoryMaterials' => $employeeMaterial->material->attributeCategoryMaterials->map(function ($attributeCategoryMaterial) {
                                return [
                                    'id' => $attributeCategoryMaterial->id,
                                    'material_id' => $attributeCategoryMaterial->material_id,
                                    'attribute_id' => $attributeCategoryMaterial->attribute_id,
                                    'category_id' => $attributeCategoryMaterial->category_id,
                                    'value' => $attributeCategoryMaterial->value,
                                    'attribute' => $attributeCategoryMaterial->attribute,
                                    'category' => $attributeCategoryMaterial->category
                                ];
                            })
                        ]
                    ];
                })
            ];

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener el empleado'], 500);
        }
    }

    public function getMaterial($materialId)
    {
        try {
            $material = Material::with([
                'branchOffice',
                'attributeCategoryMaterials',
                'attributeCategoryMaterials.attribute',
                'attributeCategoryMaterials.category',
                'employeeMaterials.employee'
            ])->findOrFail($materialId);

            // Obtener empleados disponibles en la sucursal y categoría
            $availableEmployees = $this->getAllEmployeesInBranch($material->branchOffice->id, $material->attributeCategoryMaterials->first()->category->id);
            if ($material->employeeMaterials->isNotEmpty()) {
                $availableEmployees = [];
            }
            // Construir la respuesta
            $response = [
                'id' => $material->id,
                'name' => $material->name,
                'low_date' => $material->low_date,
                'high_date' => $material->high_date,
                'branch_office' => [
                    'id' => $material->branchOffice->id,
                    'name' => $material->branchOffice->name,
                ],
                'state' => $material->state,
                'attributeCategoryMaterials' => $material->attributeCategoryMaterials->map(function ($acm) {
                    return [
                        'id' => $acm->id,
                        'value' => $acm->value,
                        'attribute' => [
                            'id' => $acm->attribute->id,
                            'name' => $acm->attribute->name
                        ],
                        'category' => [
                            'id' => $acm->category->id,
                            'name' => $acm->category->name
                        ],
                    ];
                }),
                'employee_materials' => $material->employeeMaterials->map(function ($em) {
                    return [
                        'id' => $em->id,
                        'assignment_date' => $em->assignment_date,
                        'return_date' => $em->return_date,
                        'employee' => [
                            'id' => $em->employee->id,
                            'name' => $em->employee->name,
                            'last_name' => $em->employee->last_name,
                        ],
                    ];
                }),
                'available_employees' => $availableEmployees
            ];

            return response()->json($response);
        } catch (ThrottleRequestsException $e) {
            return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ocurrió un error inesperado.'], 500);
        }
    }

    public function getAllEmployeesInBranch($branchOfficeId, $categoryId)
    {
        // Obtener los IDs de empleados que NO tienen un material asignado en la categoría especificada
        $employeeIdsWithoutCategoryMaterial = Employee::whereDoesntHave('employeeMaterials', function ($query) use ($categoryId) {
            $query->whereHas('material.attributeCategoryMaterials', function ($subquery) use ($categoryId) {
                $subquery->where('category_id', $categoryId);
            });
        })
        ->where('branch_office_id', $branchOfficeId) // Filtrar por ID de sucursal
        ->pluck('id')
        ->toArray();

        // Obtener todos los empleados que cumplen con las condiciones
        $allEmployees = Employee::whereIn('id', $employeeIdsWithoutCategoryMaterial)
            ->where('branch_office_id', $branchOfficeId) // Filtrar por ID de sucursal nuevamente para mayor seguridad
            ->get();

        // Mapear los empleados filtrados a un formato adecuado para la respuesta
        $filteredEmployeesFormatted = $allEmployees->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->name,
                'last_name' => $employee->last_name,
                'email' => $employee->email,
            ];
        });

        return $filteredEmployeesFormatted;
    }

    public function asignarMaterial(Request $request, $id)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido
            $this->checkUserRole(['1']);

            // Validar el ID del empleado
            $employeeId = $request->input('id');
            $employee = Employee::find($employeeId);

            if (!$employee) {
                return response()->json(['message' => "Empleado no encontrado "], 404);
            }

            // Validar el ID del material (que se pasa en el cuerpo de la solicitud)
            $material = Material::find($id);

            if (!$material) {
                return response()->json(['message' => 'Material no encontrado'], 404);
            }

            // Crear una nueva entrada en la tabla pivot
            $assignmentDate = now(); // Fecha actual como fecha de asignación
            $employee->employeeMaterials()->create([
                'employee_id' => $employeeId,
                'material_id' => $id,
                'assignment_date' => $assignmentDate,
                'return_date' => null,
            ]);

            return response()->json(['message' => 'Material asignado correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al asignar material: ' . $e->getMessage()], 500);
        }
    }


    public function desasignarMaterial(Request $request, $id)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido
            $this->checkUserRole(['1']);


            // Validar el ID del empleado
            $employeeId = $request->input('id');
            $employee = Employee::find($employeeId);

            if (!$employee) {
                return response()->json(['message' => 'Empleado no encontrado'], 404);
            }

            // Encuentra el material por su ID
            $material = Material::find($id);

            if (!$material) {
                return response()->json(['message' => 'Material no encontrado'], 404);
            }

            // Buscar la asignación entre el empleado y el material
            $employeeMaterial = EmployeeMaterial::where('employee_id', $employeeId)
                ->where('material_id', $id)
                ->first();

            if (!$employeeMaterial) {
                return response()->json(['message' => 'La asignación no existe'], 404);
            }

            // Eliminar la asignación
            $employeeMaterial->delete();

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
