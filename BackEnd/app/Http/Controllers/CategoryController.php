<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Material;


class CategoryController extends Controller
{

    public function categoryMaterialInfo()
    {
        // Obtener todas las categorías con sus materiales asociados y atributos
        $categories = Category::with('material')
            ->withCount([
                'material as total_materials',
                'material as active_materials' => function ($query) {
                    $query->where('state', 'active');
                },
                'material as available_materials' => function ($query) {
                    $query->where('state', 'available');
                },
                'material as inactive_materials' => function ($query) {
                    $query->where('state', 'inactive');
                }
            ])
            ->get();

        // Transformar la estructura de datos para el resultado final
        $categoryMaterialInfo = [];

        foreach ($categories as $category) {
            $categoryInfo = [
                'category_name' => $category->name,
                'total_materials' => $category->total_materials,
                'active_materials' => $category->active_materials,
                'available_materials' => $category->available_materials,
                'inactive_materials' => $category->inactive_materials,
            ];

            $categoryMaterialInfo[] = $categoryInfo;
        }

        return response()->json($categoryMaterialInfo);
    }
}