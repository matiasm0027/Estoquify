<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;

class DepartmentController extends Controller
{

    public function listDepartments()
    {
        $departments = Department::all();

        return response()->json($departments);
    }
}
