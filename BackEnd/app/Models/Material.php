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
}
