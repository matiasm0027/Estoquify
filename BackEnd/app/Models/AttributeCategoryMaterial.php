<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttributeCategoryMaterial extends Model
{
    use HasFactory;

    protected $table = 'attribute_category_material';

    protected $fillable = ['attribute_id', 'material_id', 'category_id', 'value'];
}
