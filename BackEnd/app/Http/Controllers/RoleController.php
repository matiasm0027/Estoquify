<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

class RoleController extends Controller
{
    public function listRoles()
    {
        try {
            $roles = Role::all();
            $result = $roles->map(function ($rol) {
                return [
                    'id' => $rol->id,
                    'name' => $rol->name
                ];
            });

            return response()->json($result);
        } catch (ThrottleRequestsException $e) {
            return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
        }
    }
}
