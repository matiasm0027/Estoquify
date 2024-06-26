<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Employee;
use App\Models\EmployeeMaterial;
use Illuminate\Database\Seeder;

class EmployeeMaterialSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        $employees->each(function ($employee) {
            $materialsCount = rand(3, 4);
            $materials = Material::factory()->count($materialsCount)->
            create(['state' => 'active', 'low_date' => null, 'branch_office_id' => $employee -> branch_office_id]);
            
            $materials->each(function ($material) use ($employee) {
                $employee->employeeMaterials()->create([
                    'employee_id' => $employee->id,
                    'material_id' => $material->id,
                    'assignment_date' =>now()->subDays(rand(1, 30)),
                    'return_date' => null,
                ]);
            });
        });
    }
}
