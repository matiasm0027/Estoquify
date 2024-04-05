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
            $number = rand(1, 3);
            $selectedAttributes = $attributes->random($number)->unique('id')->values();
            $selectedCategories = $categories->random($number)->unique('id')->values();
            
            $posicion = 0;
            foreach ($selectedCategories as $category) {
                AttributeCategoryMaterial::factory()->create([
                    'material_id' => $material->id,
                    'attribute_id' => $selectedAttributes[$posicion]->id,
                    'category_id' => $category->id,
                ]);
                $posicion++;
            }
        }
    }
}
