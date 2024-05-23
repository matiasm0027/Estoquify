<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\Report;
use App\Models\Material;
use App\Models\CategoryReport;
use App\Models\Faq;

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
            FaqSeeder::class,
        ]);

        // Crear registros utilizando factories
        Employee::create([
            'name' => 'admin',
             'last_name' => 'istrador',
             'email' => 'admin@gmail.com',
             'password' => bcrypt('admin123'),
             'phone_number' => '688341967',
             'first_login' => false,
             'department_id' => 1,
             'role_id' => 1,
             'branch_office_id' => 1,
        ]);
        Employee::create([
            'name' => 'mana',
             'last_name' => 'ger',
             'email' => 'manager@gmail.com',
             'password' => bcrypt('manager123'),
             'phone_number' => '688341967',
             'first_login' => false,
             'department_id' => 1,
             'role_id' => 2,
             'branch_office_id' => 1,
        ]);
        Employee::create([
            'name' => 'us',
             'last_name' => 'er',
             'email' => 'user@gmail.com',
             'password' => bcrypt('user123'),
             'phone_number' => '688341967',
             'first_login' => false,
             'department_id' => 1,
             'role_id' => 3,
             'branch_office_id' => 1,
        ]);
        Employee::factory(70)->create();
        Report::factory(10)->create();
        Material::factory(300)->create();
        CategoryReport::factory(10)->create();
        Faq::factory(5)->create();

        // Llamar a otros seeders después de crear registros
        $this->call([
            EmployeeMaterialSeeder::class,
            AttributeCategoryMaterialSeeder::class,
            MaterialNameSeeder::class,
        ]);

    }
}
