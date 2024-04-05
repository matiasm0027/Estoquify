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
        $state = $this->faker->randomElement(['active', 'inactive']);
        $lowDate = $state === 'active' ? null : $this->faker->date();

        $branchOfficeId = BranchOffice::all()->random()->id;

        return [
            'low_date' => $lowDate,
            'high_date' => $this->faker->date(),
            'state' => $state,
            'branch_office_id' => $branchOfficeId,
        ];
    }
}
