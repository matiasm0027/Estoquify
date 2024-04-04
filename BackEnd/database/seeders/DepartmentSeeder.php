<?php

namespace Database\Seeders;
use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Department::create(['name' => 'computing']);
        Department::create(['name' => 'billing']);
        Department::create(['name' => 'accounting']);
        Department::create(['name' => 'finance']);
        Department::create(['name' => 'commercial']);
        Department::create(['name' => 'sac']);
        Department::create(['name' => 'shopping']);
        Department::create(['name' => 'logistics']);
    }
}
