<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attribute; // Asegúrate de importar el modelo Attribute
use Illuminate\Http\Exceptions\ThrottleRequestsException;

class AttributeController extends Controller
{
    /**
     * Obtiene el nombre de un atributo por su ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
   

    public function listAtributos()
    {
        try{
        $attributos = Attribute::all();

        return response()->json($attributos);
    } catch (ThrottleRequestsException $e) {
        return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
    }
    }
}
