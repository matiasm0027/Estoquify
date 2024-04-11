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
        return $this->belongsToMany(Material::class, 'attribute_category_material', 'category_id', 'material_id')
            ->withPivot('value');
    }

    public function attribute()
    {
        return $this->belongsToMany(Attribute::class, AttributeCategoryMaterial::class)
                    ->withPivot('value', 'attribute_id');
    }
    
    public function report()
    {
        return $this->belongsToMany(Report::class, CategoryReport::class)
                    ->withPivot('report_id');;
    }
}
