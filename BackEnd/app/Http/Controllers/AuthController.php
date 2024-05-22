<?php

namespace App\Http\Controllers;
use Carbon\Carbon;
use App\Models\Employee;
use App\Mail\ResetPassword;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;

class AuthController extends Controller
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
}
