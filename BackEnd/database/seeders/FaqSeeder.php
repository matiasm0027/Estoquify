<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Faq;

class FaqSeeder extends Seeder
{
    
    public function run()
    {
        Faq::create([
            'titulo' => 'Como desviar correo',
            'descripcion' => 'Para desviar correo debes de ir a configuración del correo buscar opción desvio...',
        ]);
    }
}

