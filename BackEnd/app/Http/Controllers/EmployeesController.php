<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Support\Facades\Log;
use App\Mail\ResetPassword;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

class EmployeesController extends Controller
{
    // El constructor del controlador define un middleware (auth:api) que protege todos los métodos del controlador, excepto el método login.
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'resetPassword', 'resetPasswordRequest']]);
    }

    public function login()
    {
        try {
            $credentials = request(['email', 'password']);

            if (! $token = auth()->attempt($credentials)) {
                return response()->json(['error' => 'Credenciales inválidas'], 401);
            }

            return $this->respondWithToken($token);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    // Devuelve los detalles del usuario autenticado actualmente.
    public function getLoggedInUser()
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado.'], 401);
            }
            return response()->json($user);
        } catch (ThrottleRequestsException $e) {
            return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
        }
    }

    public function logout()
    {
        try {
            auth()->logout();
            return response()->json(['message' => 'Successfully logged out']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    // Este método refresca un token JWT expirado.
    public function refresh()
    {
        try {
            return $this->respondWithToken(auth()->refresh());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    // Formato de respuesta del tokens
    protected function respondWithToken($token)
    {
        try {
            $user = auth()->user();
            if ($user->first_login === 1) {
                return response()->json([
                    'first_login' => true,
                    'access_token' => $token,
                    'rol' => $user->role_id(),
                    'token_type' => 'bearer',
                    'expires_in' => auth()->factory()->getTTL() * 60
                ]);
            } else {
                return response()->json([
                    'access_token' => $token,
                    'token_type' => 'bearer',
                    'rol' => $user->role_id,
                    'expires_in' => auth()->factory()->getTTL() * 60
                ]);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function changePassword(Request $request)
    {
        try {
            $user = auth()->user(); // Obtén el usuario autenticado

            if (!$user->first_login) {
                return response()->json(['message' => 'The password has already been changed previously.'], 400);
            }

            $request->validate([
                'newPassword' => 'required|string',
                'confirmPassword' => 'required|string|same:newPassword',
            ]);

            $user->password = Hash::make($request->newPassword);
            $user->first_login = false;
            $user->save();

            return response()->json(['message' => 'Password changed successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function resetPasswordRequest(Request $request)
    {
        try {
            $email = $request->input('email');

            $employee = Employee::where('email', $email)->first();

            if (!$employee) {
                return response()->json(['error' => 'Email not found in our database'], 400);
            }

            $this->sendResetPasswordEmail($email);

            return response()->json(['message' => 'Reset password email sent successfully, please check your inbox.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }


    public function sendResetPasswordEmail($email)
    {
        try {
            $oldToken = DB::table('password_resets')->where('email', $email)->first();

            if ($oldToken) {
                return $oldToken->token;
            }

            $token = Str::random(60);
            Mail::to($email)->send(new ResetPassword($token));

            $this->saveToken($token, $email);

            return $token;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function saveToken($token, $email)
    {
        try {
            DB::table('password_resets')->insert([
                "email" => $email,
                "token" => $token,
                "created_at" => Carbon::now()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required',
                'newPassword' => 'required',
                'confirmPassword' => 'required|string|same:newPassword',
                'resetToken' => 'required',
            ]);

            $tokenExists = $this->resetPasswordTable($validated)->exists();

            if (!$tokenExists) {
                return $this->NotFound();
            }

            $this->changePasswordDB($validated);

            return response()->json(['message' => 'Successfully Changed Password'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function resetPasswordTable($request)
    {
        try {
            // Accede a los valores del array utilizando la sintaxis de array
            return DB::table('password_resets')->where(['email' => $request['email'], 'token' => $request['resetToken']]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function NotFound()
    {
        try {
            return response()->json(['error' => 'Token or email incorrect'], 300);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function changePasswordDB($request)
    {
        try {
            $employee = Employee::whereEmail($request['email'])->first();
            $employee->Update(['password' => bcrypt($request['newPassword'])]);
            $this->resetPasswordTable($request)->delete();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function listEmployees(Request $request)
    {
        try {
            $user = $request->user()->id;

            $employees = Employee::with('department', 'branchOffice', 'role')
                ->where('id', '!=', $user)
                ->orderBy('name')
                ->orderBy('last_name')
                ->get();

            return response()->json($employees);
        } catch (ThrottleRequestsException $e) {
            return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
        }
    }


    public function addEmployee(Request $request)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
            $this->checkUserRole(['1']);

            // Validar los datos de entrada del formulario
            $validatedData = $request->validate([
                'name' => 'required',
                'last_name' => 'required',
                'email' => 'required|email',
                'phone_number' => 'required',
                'password' => 'required',
                'department_id' => 'required',
                'role_id' => 'required',
                'branch_office_id' => 'required',
            ]);

            // Verificar si el correo electrónico ya está en uso
            if (Employee::where('email', $validatedData['email'])->exists()) {
                return response()->json(['error' => 'Email is already in use. Please enter a different email.'], 400);
            }

            // Crear un nuevo objeto Employee y asignar los valores
            $employee = new Employee();
            $employee->name = $validatedData['name'];
            $employee->last_name = $validatedData['last_name'];
            $employee->email = $validatedData['email'];
            $employee->phone_number = $validatedData['phone_number'];
            $employee->password = bcrypt($validatedData['password']); // Encriptar la contraseña
            $employee->department_id = $validatedData['department_id'];
            $employee->branch_office_id = $validatedData['branch_office_id'];
            $employee->role_id = $validatedData['role_id'];

            // Guardar el nuevo empleado en la base de datos
            $employee->save();

            // Devolver una respuesta de éxito
            return response()->json(['message' => 'Empleado añadido con éxito'], 201);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier otra excepción que pueda ocurrir
            return response()->json(['error' => 'Error al agregar empleado: ' . $e->getMessage()], 500);
        }
    }

    public function editEmployee(Request $request, $id)
{
    try {
        // Verificar si el usuario está autenticado
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
        $this->checkUserRole(['1']);

        // Validar los datos de entrada del formulario utilizando validate
        $validatedData = $request->validate([
            'name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email',
            'phone_number' => 'required',
            'department_id' => 'required',
            'role_id' => 'required',
            'branch_office_id' => 'required',
        ]);

        // Buscar al empleado por ID
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        // Verificar si el correo electrónico ya está en uso por otro empleado
        if ($validatedData['email'] !== $employee->email && Employee::where('email', $validatedData['email'])->exists()) {
            return response()->json(['error' => 'Email is already in use. Please enter a different email.'], 400);
        }

        // Actualizar los datos del empleado con los valores validados
        $employee->name = $validatedData['name'];
        $employee->last_name = $validatedData['last_name'];
        $employee->email = $validatedData['email'];
        $employee->department_id = $validatedData['department_id'];
        $employee->branch_office_id = $validatedData['branch_office_id'];
        $employee->role_id = $validatedData['role_id'];
        $employee->phone_number = $validatedData['phone_number'];

        // Guardar los cambios en la base de datos
        $employee->save();

        // Devolver una respuesta de éxito
        return response()->json(['message' => 'Empleado editado con éxito'], 200);
    } catch (\Exception $e) {
        // Capturar y manejar cualquier excepción que pueda ocurrir
        return response()->json(['error' => 'Error al editar empleado: ' . $e->getMessage()], 500);
    }
}


    public function deleteEmployees(Request $request, $id)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Empleado no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido para eliminar empleados (rol '1' para administrador)
            $this->checkUserRole(['1']);

            // Buscar al empleado por su ID
            $employee = Employee::find($id);

            // Si no se encuentra al empleado, devuelve un error 404
            if (!$employee) {
                return response()->json(['error' => 'Empleado no encontrado'], 404);
            }
            $employeeName = $employee->name . ' ' . $employee->last_name;
            // Eliminar al empleado
            $employee->delete();

            return response()->json(['message' => "Empleado {$employeeName} eliminado correctamente"], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function listEmployeesByBranchOffice(Request $request, $id_branch_office)
    {
        try {
            $user = $request->user()->id;

            $employees = Employee::with('department', 'branchOffice')
                ->where('id', '!=', $user)
                ->select('id', 'name', 'last_name', 'email', 'department_id', 'branch_office_id')
                ->where('branch_office_id', $id_branch_office)
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
        } catch (ThrottleRequestsException $e) {
            return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
        }
    }

    protected function checkUserRole($allowedRoles)
    {
        try {
            if (!Auth::check()) {
                // El usuario no está autenticado
                abort(401, 'Unauthorized');
            }

            $user = Auth::user();

            if (!in_array($user->role_id, $allowedRoles)) {
                // El usuario no tiene uno de los roles permitidos
                abort(403, 'Access denied');
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
}
