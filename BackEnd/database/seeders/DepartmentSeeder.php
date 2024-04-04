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
        Department::create(['name' => 'Computing', 'description' => 'Department dedicated to managing and maintaining computer systems and software.']);
        Department::create(['name' => 'Billing', 'description' => 'Department responsible for managing billing processes and invoices.']);
        Department::create(['name' => 'Accounting', 'description' => 'Department focused on financial recordkeeping, including bookkeeping, payroll, and auditing.']);
        Department::create(['name' => 'Finance', 'description' => 'Department responsible for managing financial resources and making strategic financial decisions.']);
        Department::create(['name' => 'Commercial', 'description' => 'Department focused on sales, marketing, and business development activities.']);
        Department::create(['name' => 'Sac', 'description' => 'Department dedicated to providing customer support and resolving issues and complaints.']);
        Department::create(['name' => 'Shopping', 'description' => 'Department responsible for purchasing goods and services for the organization.']);
        Department::create(['name' => 'Logistics', 'description' => 'Department responsible for managing the flow of goods, services, and information within the organization.']);
    }
}
