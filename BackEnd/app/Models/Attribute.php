<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    use HasFactory;

    protected $table = 'attributes';

    protected $fillable = ['name'];

    public function material()
    {
        return $this->belongsToMany(Material::class, AttributeCategoryMaterial::class)
                    ->withPivot('value', 'material_id');
    }

    public function category()
    {
        return $this->belongsToMany(Category::class, AttributeCategoryMaterial::class)
                    ->withPivot('value', 'category_id');
    }
}
