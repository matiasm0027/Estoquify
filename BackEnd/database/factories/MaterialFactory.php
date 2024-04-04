<?php

namespace Database\Factories;
use App\Models\Material;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Material>
 */
class MaterialFactory extends Factory
{
    protected $model = Material::class;

    public function definition()
    {
        $prefixes = ['MON', 'MOV', 'POR', 'AU', 'MOU', 'KEY'];

        return [
            'prefix' => $this->faker->randomElement($prefixes),
            'low_date' => $this->faker->date(),
            'high_date' => $this->faker->date(),
            'branch_office_id' => mt_rand(1, 10),
            'state' => $this->faker->randomElement(['Disponible', 'No disponible']),
        ];
    }
}
