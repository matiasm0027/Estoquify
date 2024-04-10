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

Route::group([

    'middleware' => 'api',
    'prefix' => 'auth'

], function ($router) {

    Route::post('login', [EmployeesController::class, 'login']);
    Route::post('refresh', [EmployeesController::class, 'refresh']);
    Route::post('me', [EmployeesController::class, 'me']);
    Route::get('listEmployees', [EmployeesController::class, 'listEmployees']);
    Route::post('addEmployee', [EmployeesController::class, 'addEmployee']);
    Route::get('listEmployeesByDepartment/{departmentId}', [EmployeesController::class, 'listEmployeesByDepartment']);
    Route::get('listEmployeesByBranchOffice/{branchOfficeId}', [EmployeesController::class, 'listEmployeesByBranchOffice']);

});
