<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Employee extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'employees';

    protected $fillable = ['name', 'last_name', 'email', 'password', 'phone_number', 'department_id', 'role_id', 'branch_office_id'];

    protected $hidden = ['password', 'remember_token',];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function branchOffice()
    {
        return $this->belongsTo(BranchOffice::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function material()
    {
        return $this->belongsToMany(Material::class, EmployeeMaterial::class)
                    ->withPivot('assignment_date', 'return_date', 'material_id');
    }

    public function report()
    {
        return $this->hasMany(Report::class);
    }

}
