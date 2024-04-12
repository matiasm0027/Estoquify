<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\DepartmentController;
Use App\Http\Controllers\BranchOfficeController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ReportController;

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
    Route::put('editEmployee/{id}', [EmployeesController::class, 'editEmployee']);
    Route::delete('deleteEmployee/{id}', [EmployeesController::class, 'deleteEmployee']);
    Route::get('listDepartments', [DepartmentController::class, 'listDepartments']);
    Route::get('listBranchOffices', [BranchOfficeController::class, 'listBranchOffices']);
    Route::get('listEmployeeMaterial/{id}', [EmployeesController::class, 'listEmployeeMaterial']);
    Route::get('categoryMaterialInfo', [CategoryController::class, 'categoryMaterialInfo']);
    Route::get('listReports', [ReportController::class, 'listReports']);

});



