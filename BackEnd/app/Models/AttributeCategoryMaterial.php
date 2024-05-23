<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttributeCategoryMaterial extends Model
{
    use HasFactory;

    protected $table = 'attribute_category_material';

    protected $fillable = ['attribute_id', 'material_id', 'category_id', 'value'];

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
