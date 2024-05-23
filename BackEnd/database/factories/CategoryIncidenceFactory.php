<?php
namespace Database\Factories;

use App\Models\Category;
use App\Models\Incidence;
use App\Models\CategoryIncidence;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryIncidenceFactory extends Factory
{
    protected $model = CategoryIncidence::class;

    public function definition()
    {
        $categories = Category::all()->pluck('id')->toArray();
        $incidence = Incidence::all()->pluck('id')->toArray();

        return [
            'category_id' => $this->faker->randomElement($categories),
            'incidence_id' => $this->faker->randomElement($incidence),
        ];
    }
}
