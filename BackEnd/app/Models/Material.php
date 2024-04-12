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
        return $this->belongsToMany(Category::class, 'attribute_category_material', 'material_id', 'category_id')
            ->withPivot('value');
    }

    public function attribute()
    {
        return $this->belongsToMany(Attribute::class, AttributeCategoryMaterial::class)
                    ->withPivot('value', 'attribute_id');
    }

    public function employee()
    {
        return $this->belongsToMany(Employee::class, 'employee_material', 'material_id', 'employee_id')
            ->withPivot('assignment_date', 'return_date');
    }
}
