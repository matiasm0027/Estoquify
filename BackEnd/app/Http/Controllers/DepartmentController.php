<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use App\Models\Department;


class DepartmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login']]);
    }

    public function listDepartments()
    {
        $departments = Department::all();

        return response()->json($departments);
    }
}
