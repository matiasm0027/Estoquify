<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $table = 'materials';

    protected $fillable = ['id', 'low_date', 'high_date', 'branch_office_id', 'state'];

    public function branchOffice()
    {
        return $this->belongsTo(BranchOffice::class);
    }

    public function category()
    {
        return $this->hasMany(Category::class, AttributeCategoryMaterial::class)
                    ->withPivot('value', 'category_id');
    }

    public function attribute()
    {
        return $this->belongsToMany(Attribute::class, AttributeCategoryMaterial::class)
                    ->withPivot('value', 'attribute_id');
    }

    public function employee()
    {
        return $this->belongsToMany(Employee::class, EmployeeMaterial::class)
                    ->withPivot('assignment_date', 'return_date', 'employee_id');
    }
}
