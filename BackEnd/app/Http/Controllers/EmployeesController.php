<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use App\Models\Employee;
class EmployeesController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::guard('employees')->attempt($credentials)) { // Utiliza el guardia 'employees'
            $employee = Auth::guard('employees')->user(); // Obtiene el usuario autenticado

            $token = $employee->createToken('AuthToken')->plainTextToken;

            return response()->json([
                'token' => $token,
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    // Agrega más campos según sea necesario
                ],
            ]);
        }

        return response()->json(['error' => 'Credenciales incorrectas'], 401);
    }
}
