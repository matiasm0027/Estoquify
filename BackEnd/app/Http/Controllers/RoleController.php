<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

class RoleController extends Controller
{
    public function listRoles()
    {
        try{
        $roles = Role::all();

        return response()->json($roles);
    } catch (ThrottleRequestsException $e) {
        return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
    }
    }
}
