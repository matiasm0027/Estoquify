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
    Route::get('me', [EmployeesController::class, 'me']);
    Route::get('listEmployees', [EmployeesController::class, 'listEmployees']);
    Route::post('addEmployee', [EmployeesController::class, 'addEmployee']);
    Route::put('editEmployee/{id}', [EmployeesController::class, 'editEmployee']);
    Route::put('changePassword', [EmployeesController::class, 'changePassword']);
    Route::delete('deleteEmployee/{id}', [EmployeesController::class, 'deleteEmployee']);
    Route::get('listEmployeeMaterial/{id}', [EmployeesController::class, 'listEmployeeMaterial']);
    Route::post('resetPasswordRequest', [EmployeesController::class, 'resetPasswordRequest']);
    Route::post('resetPassword', [EmployeesController::class, 'resetPassword']);

    Route::get('employeeInfoAssignments/{id}', [EmployeeMaterialController::class, 'employeeInfoAssignments']);

    Route::get('listDepartments', [DepartmentController::class, 'listDepartments']);
    Route::get('listBranchOffices', [BranchOfficeController::class, 'listBranchOffices']);
    Route::get('listAtributos', [AttributeController::class, 'listAtributos']);


    Route::get('categoryInfoAssignments/{id}', [CategoriaMaterialController::class, 'categoryInfoAssignments']);
    Route::get('categoryMaterialInfo', [CategoryController::class, 'categoryMaterialInfo']);
    Route::post('addCategory', [CategoryController::class, 'addCategory']);
    Route::put('editCategory/{id}', [CategoryController::class, 'editCategory']);
    Route::delete('deleteCategory/{id}', [CategoryController::class, 'deleteCategory']);
    

    Route::get('listReports', [ReportController::class, 'listReports']);

    Route::post('addMaterial', [MaterialController::class, 'addMaterial']);
    Route::delete('deleteMaterial/{id}', [MaterialController::class, 'deleteMaterial']);
    Route::put('editMaterial/{id}', [MaterialController::class, 'editMaterial']);
    Route::get('materialDetails/{id}', [MaterialController::class, 'getMaterialDetails']);

    

});



