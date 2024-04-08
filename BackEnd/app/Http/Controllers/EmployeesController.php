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

    public function verificarExistencia(Request $request, $tipo, $valor)
    {
        try {
            // Validar el tipo de verificación
            if ($tipo !== 'email' && $tipo !== 'username') {
                return response()->json(['error' => 'Tipo de verificación no válido'], 400);
            }

            // Realizar la consulta para verificar la existencia del valor único
            $usuario = Usuario::where($tipo, $valor)->first();

            if ($usuario) {
                // Si el valor ya existe en la base de datos, devuelve un error 409
                return response()->json(['error' => "El $tipo ya está en uso"], 409);
            } else {
                // Si el valor no existe, devuelve un mensaje de éxito
                return response()->json(['message' => "El $tipo está disponible"], 200);
            }
        } catch (\Exception $e) {
            // En caso de error, devolver una respuesta con el error interno del servidor
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
}
