<?php

namespace Database\Seeders;

use App\Models\AttributeCategoryMaterial;
use App\Models\Material;
use App\Models\Attribute;
use App\Models\Category;
use Illuminate\Database\Seeder;

class AttributeCategoryMaterialSeeder extends Seeder
{
    public function run()
    {
        $materials = Material::all();
        $attributes = Attribute::all();
        $categories = Category::all();

        foreach ($materials as $material) {
            // Seleccionar un conjunto aleatorio de atributos una vez por material
            $number = rand(1, 3);
            $selectedAttributes = $attributes->random($number)->unique('id')->values();

            // Seleccionar una categoría aleatoria una vez por material
            $selectedCategory = $categories->random();

            foreach ($selectedAttributes as $attribute) {
                AttributeCategoryMaterial::factory()->create([
                    'material_id' => $material->id,
                    'attribute_id' => $attribute->id,
                    'category_id' => $selectedCategory->id,
                ]);
            }
        }
    }
}
