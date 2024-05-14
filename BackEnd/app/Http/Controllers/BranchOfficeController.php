<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BranchOffice;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

class BranchOfficeController extends Controller
{

    public function listBranchOffices()
    {
        try{
        $branchOffices = BranchOffice::all();

        return response()->json($branchOffices);
    } catch (ThrottleRequestsException $e) {
        return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
    }
    }
}
