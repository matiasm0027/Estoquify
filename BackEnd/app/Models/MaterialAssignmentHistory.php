<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialAssignmentHistory extends Model
{
    use HasFactory;
    protected $table = 'material_assignments_history';

    protected $fillable = ['employee_id', 'material_id', 'assignment_date', 'return_date'];
}
