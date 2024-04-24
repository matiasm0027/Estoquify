<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;


class ReportController extends Controller{

    private $reports = [];


    public function sendReports($reports){
        
        //Son los requisitos
        $request->validate([
            'petition' => 'required|string',
            'priority' => 'required|string',
            'type' => 'required|string',
        ]); 

        //Estos son los datos que recogera de la bbdd para generar el reporte

        $report = new Report([
            'id' => Str::uuid(),
            'date' => now(),
            'petition' => $request->petition,
            'priority' => $request->priority,
            'state' => 'pending',
            'employee_id' => $employeeManagerId->id,
        ]);

        //Guardamos el reporte en la bbdd
        $report->save();

        //Mensaje de que se ha  generado correcatemente la incidencia
        return response()->json(['message' => 'Reporte generado correctamente'], 201);
    }



    public function listReports()
    {
        $reports = Report::all();
         // Obtener todos los reportes con los datos del empleado asociado
        $reports = Report::with('employee', 'categories')
        ->get()
        ->map(function ($report) {
            return [
                'id' => $report->id,
                'date' => $report->date,
                'petition' => $report->petition,
                'state' => $report->state,
                'priority' => $report->priority,
                'category_id' => $report->categories->pluck('pivot.category_id')->toArray(),
                'employee_name' => $report->employee->name . ' ' . $report->employee->last_name,
            ];
        });
        return response()->json($reports);
    }
}
