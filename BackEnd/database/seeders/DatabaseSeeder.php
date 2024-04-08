<?php

namespace Database\Seeders;
use App\Models\Employee;
use App\Models\Report;
use App\Models\Material;
use App\Models\CategoryReport;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    protected $model = Employee::class;
    
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            DepartmentSeeder::class,
            BranchOfficeSeeder::class,
            CategorySeeder::class,
            AttributeSeeder::class,
        ]);

        $employees = Employee::factory(100)->create();
        $reports = Report::factory(20)->create();
        Material::factory(50)->create();
        CategoryReport::factory(20)->create();

        $this->call([
            EmployeeMaterialSeeder::class,
            AttributeCategoryMaterialSeeder::class,
        ]);
    }
}
