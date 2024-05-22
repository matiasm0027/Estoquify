<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incidence extends Model
{
    use HasFactory;

    protected $table = 'incidences';

    protected $fillable = ['date', 'petition', 'state', 'priority', 'type', 'employee_id'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function categoryIncidences()
    {
        return $this->hasMany(CategoryIncidence::class);
    }

}
