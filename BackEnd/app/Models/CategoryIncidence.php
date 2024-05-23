<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryIncidence extends Model
{
    use HasFactory;

    protected $table = 'category_incidences';

    protected $fillable = ['category_id', 'incidence_id'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function incidence()
    {
        return $this->belongsTo(Incidence::class);
    }
}
