<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use App\Models\Employee;

class EmployeesController extends Controller
{
    //El constructor del controlador define un middleware (auth:api) que
    //protege todos los métodos del controlador, excepto el método login.
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login']]);
    }

    public function login()
    {
        $credentials = request(['email', 'password']);


        if (! $token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return $this->respondWithToken($token);
    }

    //devuelve los detalles del usuario autenticado actualmente.
    public function me()
    {
        return response()->json(auth()->user());
    }

    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    //Este método refresca un token JWT expirado.
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    //formato de respuesta del tokens
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }

    public function listEmployees()
    {
        $employees = Employee::with('department', 'branchOffice')
                ->select('id', 'name', 'last_name', 'email', 'department_id', 'branch_office_id')
                ->get()
                ->map(function ($employee) {
                    return [
                        'id' => $employee->id,
                        'name' => $employee->name,
                        'last_name' => $employee->last_name,
                        'email' => $employee->email,
                        'department' => $employee->department ? $employee->department->name : null,
                        'branch_office' => $employee->branchOffice ? $employee->branchOffice->name : null,
                    ];
                });

            return response()->json($employees);
    }

    public function addEmployee(Request $request)
    {
        // Validar los datos de entrada del formulario
        $validatedData = $request->validate([
            'nombre' => 'required',
            'apellido' => 'required',
            'email' => 'required',
            'password' => 'required',
            'departamento' => 'required',
            'sucursal' => 'required',
            'rol' => 'required',
            'telefonoMovil' => 'required',
        ]);

        try {
            // Crear un nuevo objeto Employee y asignar los valores
            $employee = new Employee();
            $employee->name = $validatedData['nombre'];
            $employee->last_name = $validatedData['apellido'];
            $employee->email = $validatedData['email'];
            $employee->password = bcrypt($validatedData['password']); // Encriptar la contraseña
            $employee->department_id = $validatedData['departamento'];
            $employee->branch_office_id = $validatedData['sucursal'];
            $employee->role_id = $validatedData['rol'];
            $employee->phone_number = $request->input('telefonoMovil');

            // Guardar el nuevo empleado en la base de datos
            $employee->save();

            // Devolver una respuesta de éxito
            return response()->json(['message' => 'Empleado añadido con éxito'], 201);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al agregar empleado: ' . $e->getMessage()], 500);
        }
    }

    public function editEmployee(Request $request, $id)
    {
        try {
            // Verificar si el usuario autenticado tiene el rol de administrador
            if ($request->user()->roles !== 'admin') {
                return response()->json(['error' => 'Acceso no autorizado. Se requiere el rol de administrador'], 403);
            }
            // Validar los datos de entrada del formulario
        $validatedData = $request->validate([
            'nombre' => 'required',
            'apellido' => 'required',
            'email' => 'required',
            'password' => 'required',
            'departamento' => 'required',
            'sucursal' => 'required',
            'rol' => 'required',
            'telefonoMovil' => 'required',
        ]);

            $employee = new Employee();
            $employee->name = $validatedData['nombre'];
            $employee->last_name = $validatedData['apellido'];
            $employee->email = $validatedData['email'];
            $employee->password = bcrypt($validatedData['password']); // Encriptar la contraseña
            $employee->department_id = $validatedData['departamento'];
            $employee->branch_office_id = $validatedData['sucursal'];
            $employee->role_id = $validatedData['rol'];
            $employee->phone_number = $request->input('telefonoMovil');

            // Guardar el nuevo empleado en la base de datos
            $employee->save();

            // Devolver una respuesta de éxito
            return response()->json(['message' => 'Empleado añadido con éxito'], 201);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al agregar empleado: ' . $e->getMessage()], 500);
        }
    }

    public function listEmployeesByDepartment($departmentId)
{
    $employees = Employee::with('department', 'branchOffice')
        ->where('department_id', $departmentId)
        ->select('id', 'name', 'last_name', 'email', 'department_id', 'branch_office_id')
        ->get()
        ->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->name,
                'last_name' => $employee->last_name,
                'email' => $employee->email,
                'department' => $employee->department ? $employee->department->name : null,
                'branch_office' => $employee->branchOffice ? $employee->branchOffice->name : null,
            ];
        });

    return response()->json($employees);
}

public function listEmployeesByBranchOffice($branchOfficeId)
{
    $employees = Employee::with('department', 'branchOffice')
        ->where('branch_office_id', $branchOfficeId)
        ->select('id', 'name', 'last_name', 'email', 'department_id', 'branch_office_id')
        ->get()
        ->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->name,
                'last_name' => $employee->last_name,
                'email' => $employee->email,
                'department' => $employee->department ? $employee->department->name : null,
                'branch_office' => $employee->branchOffice ? $employee->branchOffice->name : null,
            ];
        });

    return response()->json($employees);
}

}
