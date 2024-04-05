<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;

class EmployeesController extends Controller
{
    public function login(Request $request)
    {
        try {
            // Obtenemos solo las credenciales que queremos
            $credentials = $request->only('email', 'password');

            // Intentamos autenticar al usuario con las credenciales proporcionadas
            if (Auth::attempt($credentials)) {
                $empleado = Auth::user();

                // Crea un token de autenticación para el usuario
                $token = $empleado->createToken('AuthToken')->plainTextToken;

                // Devolvemos una respuesta JSON con el token y los detalles del empleado
                return response()->json([
                    'token' => $token,
                    'empleado' => [
                        'nombre' => $empleado->name,
                        'apellido' => $empleado->last_name,
                        'email' => $empleado->email,
                        'rol' => $empleado->role,
                    ]
                ]);
            } else {
                // Devuelve una respuesta de error si las credenciales son incorrectas
                return response()->json(['error' => 'Credenciales incorrectas'], 401);
            }
        } catch (QueryException $e) {
            // Maneja errores de base de datos
            return response()->json(['error' => 'Error de base de datos'], 500);
        } catch (\Exception $e) {
            // Maneja otros errores internos del servidor
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
}
