<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Material;
use App\Models\Attribute;
use Illuminate\Support\Facades\Auth;
use App\Models\EmployeeMaterial;

class CategoriaMaterialController extends Controller
{
    public function categoryInfoAssignments($id)
    {
        try {
            // Buscar la categoría por su ID junto con los materiales asociados y los atributos
            $category = Category::with(['material', 'attribute'])->find($id);

            if (!$category) {
                return response()->json(['error' => 'Categoría no encontrada'], 404);
            }

            foreach ($category->material as $material) {
                // Verificar si el material no tiene un registro en la tabla pivot employee_material
                $employeeMaterial = EmployeeMaterial::where('material_id', $material->id)->first();
                if (!$employeeMaterial && $material->state == 'active' && $material->low_date === null) {
                    // Cambiar el estado del material a "disponible"
                    $material->state = 'available';
                    $material->save();
                }else if ($employeeMaterial && $material->state == 'available'){
                    $material->state = 'active';
                    $material->save();
                }else if ($material->low_date !== null) {
                    $material->state = 'inactive';
                    $material->save();
                }
            }

            // Construir la respuesta con la información de la categoría, materiales y atributos
            $categoryInfo = [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'materials' => $category->material,
                'attributes' => $category->attribute,
            ];

            return response()->json($categoryInfo);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
}
