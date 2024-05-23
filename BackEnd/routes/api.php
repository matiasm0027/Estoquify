<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\DepartmentController;
Use App\Http\Controllers\BranchOfficeController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\IncidenceController;
use App\Http\Controllers\EmployeeMaterialController;
use App\Http\Controllers\CategoriaMaterialController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AuthController;

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

    //Auth
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('getLoggedInUser', [AuthController::class, 'getLoggedInUser']);
    Route::put('changePassword', [AuthController::class, 'changePassword']);
    Route::post('resetPasswordRequest', [AuthController::class, 'resetPasswordRequest']);
    Route::post('resetPassword', [AuthController::class, 'resetPassword']);

    Route::get('listEmployees', [EmployeesController::class, 'listEmployees']);
    Route::post('addEmployee', [EmployeesController::class, 'addEmployee']);
    Route::put('editEmployee/{id}', [EmployeesController::class, 'editEmployee']);
    Route::delete('deleteEmployees/{id}', [EmployeesController::class, 'deleteEmployees']);
    Route::get('listEmployeeMaterial/{id}', [EmployeesController::class, 'listEmployeeMaterial']);
    Route::get('listEmployeesByBranchOffice/{id_branch_office}', [EmployeesController::class, 'listEmployeesByBranchOffice']);
    Route::get('getEmployeesByBranchOffice', [EmployeesController::class, 'getEmployeesByBranchOffice']);

    Route::get('getEmployee/{id}', [EmployeeMaterialController::class, 'getEmployee']);
    Route::get('getMaterial/{id}', [EmployeeMaterialController::class, 'getMaterial']);
    Route::post('asignarMaterial/{id}', [EmployeeMaterialController::class, 'asignarMaterial']);
    Route::post('desasignarMaterial/{id}', [EmployeeMaterialController::class, 'desasignarMaterial']);

    Route::get('listDepartments', [DepartmentController::class, 'listDepartments']);
    Route::get('listBranchOffices', [BranchOfficeController::class, 'listBranchOffices']);
    Route::get('listAtributos', [AttributeController::class, 'listAtributos']);
    Route::get('listRoles', [RoleController::class, 'listRoles']);

    Route::get('categoryMaterialInfo/{id}', [CategoryController::class, 'categoryMaterialInfo']);
    Route::get('categoryMaterial', [CategoryController::class, 'categoryMaterial']);
    Route::post('addCategory', [CategoryController::class, 'addCategory']);
    Route::put('editCategory/{id}', [CategoryController::class, 'editCategory']);
    Route::delete('deleteCategory/{id}', [CategoryController::class, 'deleteCategory']);

    Route::post('addMaterial', [MaterialController::class, 'addMaterial']);
    Route::delete('deleteMaterial/{id}', [MaterialController::class, 'deleteMaterial']);
    Route::put('editMaterial/{id}', [MaterialController::class, 'editMaterial']);

    Route::get('listIncidences', [IncidenceController::class, 'listIncidences']);
    Route::post('agregarReporte', [ReportController::class, 'sendReports']);
    Route::put('changeIncidenceStatus/{id}', [IncidenceController::class, 'changeIncidenceStatus']);
});



