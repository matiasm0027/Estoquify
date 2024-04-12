<?php

namespace Database\Factories;
use App\Models\Material;
use App\Models\BranchOffice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Material>
 */
class MaterialFactory extends Factory
{
    protected $model = Material::class;

    public function definition()
    {
        $state = $this->faker->randomElement(['inactive', 'available']);
        $lowDate = $state === 'inactive' ? $this->faker->date() : null;

        $branchOfficeId = BranchOffice::all()->random()->id;

        return [
            'name' => $this->faker->word(),
            'low_date' => $lowDate,
            'high_date' => $this->faker->date(),
            'state' => $state,
            'branch_office_id' => $branchOfficeId,
        ];
    }
}
