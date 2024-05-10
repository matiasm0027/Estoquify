<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Material;
use App\Models\Attribute;
use App\Models\Category;

class MaterialNameSeeder extends Seeder
{
    public function run()
    {
        // Obtener todos los materiales con sus categorías y atributos relacionados
        $materials = Material::with(['category'])->get();

        // Iterar sobre cada material
        foreach ($materials as $material) {
            // Obtener la primera categoría asociada al material
            $category = $material->category->first();


            // Obtener la cantidad de materiales con el mismo prefijo
            $count = Material::where('name', 'like', $category->name . '_%')->count() + 1;

            // Construir el nuevo nombre del material
            $newName = substr($category->name, 0, 3) . '_' . str_pad($count, 3, '0', STR_PAD_LEFT);

            // Actualizar el nombre del material
            $material->update(['name' => $newName]);
        }
    }
}
