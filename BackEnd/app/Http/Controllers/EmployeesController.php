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
}
