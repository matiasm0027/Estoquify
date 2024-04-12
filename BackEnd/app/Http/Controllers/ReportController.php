<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['listReports']]);
    }

    public function listReports()
    {
        $reports = Report::all();

        return response()->json($reports);
    }
}
