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
    public function getAttributeName($id)
    {
        try {
            // Buscar el atributo por su ID
            $attribute = Attribute::find($id);

            // Verificar si se encontró el atributo
            if (!$attribute) {
                return response()->json(['error' => 'Atributo no encontrado'], 404);
            }

            // Devolver el nombre del atributo en la respuesta
            return response()->json(['name' => $attribute->name]);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
}
