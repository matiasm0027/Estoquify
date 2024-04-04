<?php

namespace Database\Seeders;
use App\Models\BranchOffice;
use Illuminate\Database\Seeder;

class BranchOfficeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BranchOffice::create(['name' => 'Barcelona', 'its_central' => true]);
        BranchOffice::create(['name' => 'Madrid']);
        BranchOffice::create(['name' => 'Gerona']);
        BranchOffice::create(['name' => 'Tarragona']);
        BranchOffice::create(['name' => 'LLeida']);
        BranchOffice::create(['name' => 'Galicia']);
        BranchOffice::create(['name' => 'Malaga']);
    }
}
