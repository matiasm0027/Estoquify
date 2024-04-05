<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Employee;
use Illuminate\Database\Seeder;

class EmployeeMaterialSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        $employees->each(function ($employee) {
            $materialsCount = rand(3, 4);
            $materials = Material::factory()->count($materialsCount)->create(['branch_office_id' => $employee->branch_office_id]);

            $materials->each(function ($material) use ($employee) {
                $employee->material()->attach($material, [
                    'assignment_date' => now()->subDays(rand(1, 30)),
                    'return_date' => null,
                ]);
            });
        });
    }
}
