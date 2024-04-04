<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'prefix', 'low_date', 'high_date', 'branch_office_id', 'state'];

    protected static function booted()
    {
        static::creating(function ($material) {
            $lastMaterial = Material::where('id', 'like', $material->prefix . '%')->latest()->first();

            $newIdNumber = $lastMaterial ? (int)substr($lastMaterial->id, strlen($material->prefix)) + 1 : 1;
            $newId = $material->prefix . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);

            $material->id = $newId;
        });
    }
}
