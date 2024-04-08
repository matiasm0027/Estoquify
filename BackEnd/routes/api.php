<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeesController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/login', [EmployeesController::class, 'login']); // Iniciar sesión
Route::get('/verificar/{tipo}/{valor}', [EmployeesController::class, 'verificarExistencia']); // Verificar existencia de valor único
Route::middleware('auth:sanctum')->get('/user-details', [UsuarioController::class, 'userDetails']); // Detalles de usuario autenticado

