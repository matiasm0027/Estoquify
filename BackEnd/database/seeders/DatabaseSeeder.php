<?php

namespace Database\Seeders;
use App\Models\Employee;
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
        ]);

        Employee::factory(100)->create();
    }
}
