<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use App\Models\BranchOffice;


class BranchOfficeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login']]);
    }

    public function listBranchOffices()
    {
        $branchOffices = BranchOffice::all();

        return response()->json($branchOffices);
    }
}
