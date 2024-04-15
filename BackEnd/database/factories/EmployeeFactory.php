<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Role;
use App\Models\Department;
use App\Models\BranchOffice;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        $roleIds = Role::pluck('id')->toArray();
        $departmentIds = Department::pluck('id')->toArray();
        $branchOfficeIds = BranchOffice::pluck('id')->toArray();

        $randomNumber = $this->faker->numberBetween(100, 800);
        $name = $this->faker->firstName();
        $email = strtolower($name) . $randomNumber . '@gmail.com';
        $phone_number = $this->faker->numerify('#########');

        return [
             'name' => $name,
             'last_name' => $this->faker->lastName,
             'email' => $email,
             'password' => bcrypt($phone_number),
             'phone_number' => $phone_number,
             'department_id' => $this->faker->randomElement($departmentIds),
             'role_id' => $this->faker->randomElement($roleIds),
             'branch_office_id' => $this->faker->randomElement($branchOfficeIds),
         ];
    }
}
