<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $table = 'reports';

    protected $fillable = ['date', 'petition', 'state', 'priority', 'employee_id'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function category()
    {
        return $this->belongsToMany(Category::class, CategoryReport::class)
                    ->withPivot('category_id');;
    }
}
