<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $table = 'reports';

    protected $fillable = ['date', 'petition', 'state', 'priority', 'type', 'employee_id'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function category()
    {
        return $this->belongsToMany(Category::class, 'category_report', 'report_id', 'category_id')
                    ->withTimestamps(); // Si la tabla pivot tiene campos de marca de tiempo, agrega esto
    }
}
