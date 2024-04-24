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



    //Generamos función para mostrar los reportes
    public function listReports(){
        $report = Report::with('employee')
        ->get()
        ->map(function ($report) {
            $estadoIncidencia = $report->state;
            $prioridad = $report->priority;
            return [
                'id' => $report->id,
                'date' => $report->date,
                'petition' => $report->petition,
                'state' => $report->state,
                'priority' => $report->priority,
                'type' => $report->type,
                'employee_name' => $report->employee->name . ' ' . $report->employee->last_name,
                'assigned_state' => asignarEstado($estadoIncidencia),
                'assigned_priority' => asignarPrioridad($prioridad),
            ];
        });
        return response()->json($reports);
    }
}
