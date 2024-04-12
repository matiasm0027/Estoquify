<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;

class ReportController extends Controller
{

    public function listReports()
    {
        $reports = Report::with('employee')
        ->get()
        ->map(function ($report) {
            return [
                'id' => $report->id,
                'date' => $report->date,
                'petition' => $report->petition,
                'state' => $report->state,
                'priority' => $report->priority,
                'employee_name' => $report->employee->name . ' ' . $report->employee->last_name,
            ];
        });

        return response()->json($reports);
    }
}
