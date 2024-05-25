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
            // Retrieve all roles
            $roles = Role::all();
            // Map roles to desired format
            $result = $roles->map(function ($rol) {
                return [
                    'id' => $rol->id,
                    'name' => $rol->name
                ];
            });
            // Return JSON response with roles data
            return response()->json($result);
        } catch (ThrottleRequestsException $e) {
            // Handle ThrottleRequestsException
            return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
        }
    }
  
}
