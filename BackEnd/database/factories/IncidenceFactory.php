<?php

namespace Database\Factories;
use App\Models\Employee;
use App\Models\Incidence;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class IncidenceFactory extends Factory
{
    protected $model = Incidence::class;

    public function definition(): array
    {

        $employeeManagerId = Employee::where('role_id', 2)->inRandomOrder()->first();
        $priorities = ['High', 'Medium', 'Low'];
        $states = ['pending', 'accepted', 'rejected']; 
        $type = ['Alta Empleado', 'Solicitud Material'];

        return [
            'date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'petition' => $this->faker->sentence(),
            'priority' => $this->faker->randomElement($priorities),
            'type' => $this->faker->randomElement($type),
            'state' => $this->faker->randomElement($states),
            'employee_id' => $employeeManagerId,
        ];
    }
}
