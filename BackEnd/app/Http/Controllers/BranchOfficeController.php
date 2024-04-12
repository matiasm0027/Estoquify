<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BranchOffice;

class BranchOfficeController extends Controller
{

    public function listBranchOffices()
    {
        $branchOffices = BranchOffice::all();

        return response()->json($branchOffices);
    }
}
