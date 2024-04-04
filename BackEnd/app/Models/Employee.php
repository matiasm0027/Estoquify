<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Employee extends Model
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'employees'; // Nombre de la tabla en la base de datos

    protected $fillable = [
        'name',
        'last_name',
        'email',
        'password',
        'phone_number',
        'department_id',
        'role_id',
        'branch_office_id'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function branchOffice()
    {
        return $this->belongsTo(BranchOffice::class);
    }
}
