<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attribute; // Asegúrate de importar el modelo Attribute

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
        $attributos = Attribute::all();

        return response()->json($attributos);
    }
}
