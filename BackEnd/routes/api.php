<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\DepartmentController;
Use App\Http\Controllers\BranchOfficeController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\EmployeeMaterialController;
use App\Http\Controllers\CategoriaMaterialController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\RoleController;

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
    Route::get('getLoggedInUser', [EmployeesController::class, 'getLoggedInUser']);
    Route::get('listEmployees', [EmployeesController::class, 'listEmployees']);
    Route::post('addEmployee', [EmployeesController::class, 'addEmployee']);
    Route::put('editEmployee/{id}', [EmployeesController::class, 'editEmployee']);
    Route::put('changePassword', [EmployeesController::class, 'changePassword']);
    Route::delete('deleteEmployees/{id}', [EmployeesController::class, 'deleteEmployees']);
    Route::get('listEmployeeMaterial/{id}', [EmployeesController::class, 'listEmployeeMaterial']);
    Route::post('resetPasswordRequest', [EmployeesController::class, 'resetPasswordRequest']);
    Route::post('resetPassword', [EmployeesController::class, 'resetPassword']);
    Route::get('listEmployeesByBranchOffice/{id_branch_office}', [EmployeesController::class, 'listEmployeesByBranchOffice']);

    Route::get('getEmployee/{id}', [EmployeeMaterialController::class, 'getEmployee']);
    Route::get('materialAssignedEmployees/{id}', [EmployeeMaterialController::class, 'materialAssignedEmployees']);
    Route::post('asignarMaterial/{materialId}', [EmployeeMaterialController::class, 'asignarMaterial']);
    Route::post('desasignarMaterial/{materialId}', [EmployeeMaterialController::class, 'desasignarMaterial']);

    Route::get('listDepartments', [DepartmentController::class, 'listDepartments']);
    Route::get('listBranchOffices', [BranchOfficeController::class, 'listBranchOffices']);
    Route::get('listAtributos', [AttributeController::class, 'listAtributos']);
    Route::get('listRoles', [RoleController::class, 'listRoles']);

    Route::get('categoryInfoAssignments/{id}', [CategoryController::class, 'categoryInfoAssignments']);
    Route::get('categoryMaterialInfo', [CategoryController::class, 'categoryMaterialInfo']);
    Route::post('addCategory', [CategoryController::class, 'addCategory']);
    Route::put('editCategory/{id}', [CategoryController::class, 'editCategory']);
    Route::delete('deleteCategory/{id}', [CategoryController::class, 'deleteCategory']);


    Route::get('listReports', [ReportController::class, 'listReports']);
    Route::post('agregarReporte', [ReportController::class, 'sendReports']);
    Route::put('changeReportStatus/{id}', [ReportController::class, 'changeReportStatus']);

    Route::post('addMaterial', [MaterialController::class, 'addMaterial']);
    Route::delete('deleteMaterial/{id}', [MaterialController::class, 'deleteMaterial']);
    Route::put('editMaterial/{id}', [MaterialController::class, 'editMaterial']);
    Route::get('materialDetails/{id}', [MaterialController::class, 'getMaterialDetails']);

});



