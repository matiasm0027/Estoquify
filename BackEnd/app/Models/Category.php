<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = ['name'];



    public function activeMaterial()
    {
        return $this->material()->where('state', 'active');
    }

    public function availableMaterial()
    {
        return $this->material()->where('state', 'available');
    }

    public function inactiveMaterial()
    {
        return $this->material()->where('state', 'inactive');
    }

    public function report()
    {
        return $this->belongsToMany(Report::class, CategoryReport::class)
                    ->withPivot('report_id');
    }

    public function attributeCategoryMaterials()
    {
        return $this->hasMany(AttributeCategoryMaterial::class);
    }
        // public function material()
    // {
    //     return $this->belongsToMany(Material::class,attribute::class, 'attribute_category_material', 'category_id', 'material_id', 'attribute_id');
    // }
    // public function attribute()
    // {
    //     return $this->belongsToMany(Attribute::class, AttributeCategoryMaterial::class)
    //                 ->withPivot('value', 'attribute_id');
    // }
    // public function material()
    // {
    //     return $this->belongsToMany(Material::class, 'attribute_category_material')
    //                 ->withPivot('attribute_id', 'value')
    //                 ->withTimestamps();
    // }

    // public function attribute()
    // {
    //     return $this->belongsToMany(Attribute::class, 'attribute_category_material')
    //                 ->withPivot('material_id', 'value')
    //                 ->withTimestamps();
    // }

}
