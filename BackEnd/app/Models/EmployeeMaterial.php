<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeMaterial extends Model
{
    use HasFactory;
    protected $table = 'employee_material';

    protected $fillable = ['employee_id', 'material_id', 'assignment_date', 'return_date'];

}
