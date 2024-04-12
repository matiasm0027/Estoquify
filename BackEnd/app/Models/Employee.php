<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Employee extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

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
        return $this->belongsToMany(Material::class, 'employee_material', 'employee_id', 'material_id')
            ->withPivot('assignment_date', 'return_date');
    }

    public function report()
    {
        return $this->hasMany(Report::class);
    }

    public function getJWTIdentifier(){
        return $this->getKey();
    }

    public function getJWTCustomClaims(){
        return [];
    }

}
