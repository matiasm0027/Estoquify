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

class EmployeesController extends Controller
{
    //El constructor del controlador define un middleware (auth:api) que
    //protege todos los métodos del controlador, excepto el método login.
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'resetPassword', 'resetPasswordRequest']]);
    }

    public function login()
    {
        $credentials = request(['email', 'password']);

        if (! $token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
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
        $user = auth()->user();
        if ($user->first_login === 1) {
            return response()->json([
                'first_login' => true,
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60
            ]);
        } else {
            return response()->json([
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60
            ]);
        }
    }

    public function changePassword(Request $request)
    {
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
            // Return an error response with a meaningful message
            return response()->json(['error' => 'An unexpected error occurred while processing your request.'], 500);
        }
    }


    public function sendResetPasswordEmail($email)
    {
        $oldToken = DB::table('password_resets')->where('email', $email)->first();

        if ($oldToken) {
            return $oldToken->token;
        }

        $token = Str::random(60);
        Mail::to($email)->send(new ResetPassword($token));

        $this->saveToken($token, $email);


        return $token;
    }

    public function saveToken($token, $email){
        DB::table('password_resets')->insert([
            "email" => $email,
            "token" => $token,
            "created_at" => Carbon::now()
        ]);
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

        return $this->resetPasswordTable($validated) ? $this->changePasswordDB($validated) :
            $this->NotFound();
    } catch (\Exception $e) {
        \Log::error('Reset password erroremail2: ' . $e->getMessage());

        // Return an error response with a meaningful message
        return response()->json(['error' => 'An unexpected error occurred while processing your request.'], 500);
    }
}

    public function resetPasswordTable($request)
    {
        \Log::info($request['email']);

        // Accede a los valores del array utilizando la sintaxis de array
        return DB::table('password_resets')->where(['email' => $request['email'], 'token' => $request['resetToken']]);
    }

    public function NotFound(){
        return response()->json(['error' => 'Token or email incorrect']);
    }

    public function changePasswordDB($request){
        $employee = Employee::whereEmail($request['email'])->first();
        $employee->Update(['password' => bcrypt($request['newPassword'])]);
        $this->resetPasswordTable($request)->delete();
        return response()->json(['message' => 'Successfully Changed Password'], 200);

    }

    public function listEmployees(Request $request)
    {
        $user = $request->user()->id;

        $employees = Employee::with('department', 'branchOffice')
            ->where('id', '!=', $user) // Excluir al usuario actual
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
        try {
         // Verificar si el usuario está autenticado
         $user = $request->user();
         //dd($user->role_id);
         if (!$user) {
             return response()->json(['error' => 'Usuario no autenticado'], 401);
         }

         // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
         $this->checkUserRole(['1']);

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


            // Crear un nuevo objeto Employee y asignar los valores
            $employee = new Employee();
            $employee->name = $validatedData['nombre'];
            $employee->last_name = $validatedData['apellido'];
            $employee->email = $validatedData['email'];
            $employee->password = bcrypt($validatedData['password']); // Encriptar la contraseña
            $employee->department_id = $validatedData['departamento'];
            $employee->branch_office_id = $validatedData['sucursal'];
            $employee->role_id = $validatedData['rol'];
            $employee->phone_number = $validatedData['telefonoMovil'];

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
            // Verificar si el usuario está autenticado
            $user = $request->user();
            //dd($user->role_id);
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
            $this->checkUserRole(['1']);

            // Validar los datos de entrada del formulario utilizando validate
            $validatedData = $request->validate([
                'nombre' => 'required',
                'apellido' => 'required',
                'email' => 'required|email',
                'password' => 'min:6',
                'departamento' => 'required',
                'sucursal' => 'required',
                'rol' => 'required',
                'telefonoMovil' => 'required',
            ]);

            // Buscar al empleado por ID
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json(['error' => 'Empleado no encontrado'], 404);
            }

            // Actualizar los datos del empleado con los valores validados
            $employee->name = $validatedData['nombre'];
            $employee->last_name = $validatedData['apellido'];
            $employee->email = $validatedData['email'];
            $employee->password = bcrypt($validatedData['password']);
            $employee->department_id = $validatedData['departamento'];
            $employee->branch_office_id = $validatedData['sucursal'];
            $employee->role_id = $validatedData['rol'];
            $employee->phone_number = $validatedData['telefonoMovil'];

            // Guardar los cambios en la base de datos
            $employee->save();

            // Devolver una respuesta de éxito
            return response()->json(['message' => 'Empleado editado con éxito'], 200);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al editar empleado: ' . $e->getMessage()], 500);
        }
    }

    public function deleteEmployee(Request $request, $id)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            //dd($user->role_id);
            if (!$user) {
                return response()->json(['error' => 'Empleado no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
            $this->checkUserRole(['1']);

            // Buscar al usuario por su ID
            $employee = Employee::find($id);

            // Si no se encuentra al usuario devuelve un error 404
            if (!$employee) {
                return response()->json(['error' => 'Empleado no encontrado'], 404);
            }

            // Eliminar al usuario
            $employee->delete();

            return response()->json(['message' => 'Empleado eliminado correctamente'], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
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
