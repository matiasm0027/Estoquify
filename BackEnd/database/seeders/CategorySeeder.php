<?php

namespace Database\Seeders;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::create(['name' => 'Monitors']);
        Category::create(['name' => 'Mobiles']);
        Category::create(['name' => 'Laptops']);
        Category::create(['name' => 'Headphones']);
        Category::create(['name' => 'Mouse']);
        Category::create(['name' => 'Keyboards']);
    }
}
