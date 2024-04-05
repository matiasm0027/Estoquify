<?php

namespace Database\Factories;
use App\Models\EmployeeMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmployeeMaterial>
 */
class EmployeeMaterialFactory extends Factory
{
    protected $model = EmployeeMaterial::class;

    public function definition()
    {
        return [
            'employee_id' => null,
            'material_id' => null,
            'assignment_date' => $this->faker->date(),
            'return_date' => null,
        ];
    }
}
