<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;
use Illuminate\Http\Exceptions\ThrottleRequestsException;


class DepartmentController extends Controller
{

    public function listDepartments()
    {
        try{
        $departments = Department::all();

        return response()->json($departments);
    } catch (ThrottleRequestsException $e) {
        return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
    }
    }
}
