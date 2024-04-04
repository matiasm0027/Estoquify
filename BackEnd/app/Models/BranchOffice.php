<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchOffice extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'its_central'];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function materials()
    {
        return $this->hasMany(Material::class);
    }
}
