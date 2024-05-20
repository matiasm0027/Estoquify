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
    public function attributeCategoryMaterials()
    {
        return $this->hasMany(AttributeCategoryMaterial::class);
    }

    public function employeeMaterials()
    {
        return $this->hasMany(EmployeeMaterial::class);
    }
    // public function category()
    // {
    //     return $this->belongsToMany(Category::class, 'attribute_category_material')
    //                 ->withPivot('attribute_id', 'value')
    //                 ->withTimestamps();
    // }

    // public function attribute()
    // {
    //     return $this->belongsToMany(Attribute::class, 'attribute_category_material')
    //                 ->withPivot('category_id', 'value')
    //                 ->withTimestamps();
    // }


    // public function employee()
    // {
    //     return $this->belongsToMany(Employee::class, 'employee_material', 'material_id', 'employee_id')
    //         ->withPivot('assignment_date', 'return_date');
    // }
}
