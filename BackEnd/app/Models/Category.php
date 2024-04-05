<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = ['name'];

    public function material()
    {
        return $this->belongsTo(Material::class, AttributeCategoryMaterial::class)
                    ->withPivot('value', 'material_id');
    }

    public function attribute()
    {
        return $this->belongsToMany(Attribute::class, AttributeCategoryMaterial::class)
                    ->withPivot('value', 'attribute_id');
    }
}
