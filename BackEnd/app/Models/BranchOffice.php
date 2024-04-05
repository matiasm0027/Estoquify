<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchOffice extends Model
{
    use HasFactory;

    protected $table = 'branch_offices';

    protected $fillable = ['name', 'its_central'];

    public function employee()
    {
        return $this->hasMany(Employee::class);
    }

    public function material()
    {
        return $this->hasMany(Material::class);
    }
}
