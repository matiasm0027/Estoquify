<?php

namespace Database\Seeders;

use App\Models\Attribute;
use Illuminate\Database\Seeder;

class AttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Attribute::create(['name' => 'Size']);
        Attribute::create(['name' => 'Resolution']);
        Attribute::create(['name' => 'Refresh Rate']);
        Attribute::create(['name' => 'Panel Type']);
        Attribute::create(['name' => 'Brand']);
        Attribute::create(['name' => 'Model']);
        Attribute::create(['name' => 'Operating System']);
        Attribute::create(['name' => 'Screen Size']);
        Attribute::create(['name' => 'Processor']);
        Attribute::create(['name' => 'RAM']);
        Attribute::create(['name' => 'Type']);
        Attribute::create(['name' => 'Connectivity']);
        Attribute::create(['name' => 'Color']);
        Attribute::create(['name' => 'DPI']);
        Attribute::create(['name' => 'Buttons']);
        Attribute::create(['name' => 'Backlight']);
        Attribute::create(['name' => 'Layout']);
    }
}
