<?php
namespace Database\Factories;

use App\Models\Category;
use App\Models\Report;
use App\Models\CategoryReport;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryReportFactory extends Factory
{
    protected $model = CategoryReport::class;

    public function definition()
    {
        $categories = Category::all()->pluck('id')->toArray();
        $reports = Report::all()->pluck('id')->toArray();

        return [
            'category_id' => $this->faker->randomElement($categories),
            'report_id' => $this->faker->randomElement($reports),
        ];
    }
}
