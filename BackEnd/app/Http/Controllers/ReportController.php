<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use Illuminate\Support\Facades\Validator;
use App\Models\Category;
use App\Models\CategoryReport;
use Illuminate\Support\Facades\Auth;


class ReportController extends Controller{

    public function sendReports(Request $request){
        
         // Define las reglas de validación
         $rules = [
            'petition' => 'required|string',
            'priority' => 'required|string',
            'type' => 'required|string',
        ];

        // Si el tipo de reporte es "Solicitud Material", requerir la presencia de categorías
        if ($request->input('type') === 'Solicitud Material') {
            $rules['category'] = 'required|array';
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), $rules);

        // Comprobar si hay errores de validación
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        //Estos son los datos que recogera de la bbdd para generar el reporte
        $reportData = [
            'date' => $request->date,
            'petition' => $request->petition,
            'priority' => $request->priority,
            'state' => 'pending',
            'type' => $request->type,
            'employee_id' => $request->employee_id,
        ];

        //Si el reporte es una alta no adjuntara las categorias, si es una solicitud 
        if ($request->type === 'Empleado Alta') {
            $report = new Report($reportData);
             //Guardamos el reporte en la bbdd
            $report->save();
        } else {
            $report = new Report($reportData);
            //Guardamos el reporte en la bbdd
            $report->save();
            $reportId = $report->id;
            $report->category()->attach($request->category, ['report_id' => $reportId]);
        }

       

        //Mensaje de que se ha  generado correcatemente la incidencia
        return response()->json(['message' => 'Reporte generado correctamente'], 201);
    }



    public function listReports()
    {
        $reports = Report::all();
         // Obtener todos los reportes con los datos del empleado asociado
        $reports = Report::with('employee')
        ->get()
        ->map(function ($report) {
            return [
                'id' => $report->id,
                'date' => $report->date,
                'petition' => $report->petition,
                'state' => $report->state,
                'priority' => $report->priority,
                'type' => $report->type,
                'employee_name' => $report->employee->name . ' ' . $report->employee->last_name,
                'employee_id_sucursal' => $report->employee->branch_office_id ,
            ];
        });
        return response()->json($reports);
    }
}
