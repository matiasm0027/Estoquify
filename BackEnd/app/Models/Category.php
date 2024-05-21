<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = ['name'];

    public function report()
    {
        return $this->belongsToMany(Report::class, CategoryReport::class)
                    ->withPivot('report_id');
    }

    public function attributeCategoryMaterials()
    {
        return $this->hasMany(AttributeCategoryMaterial::class);
    }
}
