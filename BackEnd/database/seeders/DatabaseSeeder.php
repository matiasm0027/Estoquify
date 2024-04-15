<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\Report;
use App\Models\Material;
use App\Models\CategoryReport;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Llamar a otros seeders
        $this->call([
            RoleSeeder::class,
            DepartmentSeeder::class,
            BranchOfficeSeeder::class,
            CategorySeeder::class,
            AttributeSeeder::class,
        ]);

        // Crear registros utilizando factories
        Employee::factory(100)->create();
        Report::factory(20)->create();
        Material::factory(50)->create();
        CategoryReport::factory(20)->create();

        // Llamar a otros seeders después de crear registros
        $this->call([
            EmployeeMaterialSeeder::class,
            AttributeCategoryMaterialSeeder::class,
        ]);
    }
}
