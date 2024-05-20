<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    use HasFactory;

    protected $table = 'attributes';

    protected $fillable = ['name'];

    public function attributeCategoryMaterials()
    {
        return $this->hasMany(AttributeCategoryMaterial::class);
    }
    // public function material()
    // {
    //     return $this->belongsToMany(Material::class, AttributeCategoryMaterial::class)
    //                 ->withPivot('value', 'material_id');
    // }

    // public function category()
    // {
    //     return $this->belongsToMany(Category::class, AttributeCategoryMaterial::class)
    //                 ->withPivot('value', 'category_id');
    // }
    // public function material()
    // {
    //     return $this->belongsToMany(Material::class, 'attribute_category_material')
    //                 ->withPivot('category_id', 'value')
    //                 ->withTimestamps();
    // }

    // public function category()
    // {
    //     return $this->belongsToMany(Category::class, 'attribute_category_material')
    //                 ->withPivot('material_id', 'value')
    //                 ->withTimestamps();
    // }

}
