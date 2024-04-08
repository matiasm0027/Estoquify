<?php

namespace Database\Factories;
use App\Models\AttributeCategoryMaterial;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class AttributeCategoryMaterialFactory extends Factory
{
    protected $model = AttributeCategoryMaterial::class;

    public function definition(): array
    {
        return [
            'material_id' => null, 
            'attribute_id' => null,
            'category_id' => null,
            'value' => $this->faker->word,
        ];
    }
}
