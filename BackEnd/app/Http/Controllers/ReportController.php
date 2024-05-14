<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use Illuminate\Support\Facades\Validator;
use App\Models\Category;
use App\Models\CategoryReport;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Exceptions\ThrottleRequestsException;


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
        if ($request->type === 'Solicitud Material') {
            $report = new Report($reportData);
            //Guardamos el reporte en la bbdd
            $report->save();
            $reportId = $report->id;
            $report->category()->attach($request->category, ['report_id' => $reportId]);
        } else {
            $report = new Report($reportData);
            //Guardamos el reporte en la bbdd
           $report->save();
        }

       

        //Mensaje de que se ha  generado correcatemente la incidencia
        return response()->json(['message' => 'Reporte generado correctamente'], 201);
    }



    public function listReports()
    {
        try{
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
                'updated' => $report->updated_at,
                'employee_id' => $report->employee->id,
                'employee_name' => $report->employee->name . ' ' . $report->employee->last_name,
                'employee_id_sucursal' => $report->employee->branch_office_id ,
            ];
        });
        return response()->json($reports);
    } catch (ThrottleRequestsException $e) {
        return response()->json(['error' => 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'], 429);
    }
    }

    public function changeReportStatus(Request $request, $id)
{
    try {
        // Verifica si el usuario está autenticado
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        // Verifica si el usuario tiene el rol permitido
        $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido

        // Encuentra el reporte por su ID
        $report = Report::find($id);

        // Verifica si se encontró el reporte
        if (!$report) {
            return response()->json(['message' => 'El reporte no fue encontrado'], 404);
        }

        // Valida el estado proporcionado en la solicitud
        $request->validate([
            'estado' => 'required|in:accepted,rejected,pending' // Asegúrate de incluir todos los posibles estados aquí
        ]);

        // Actualiza el estado del reporte
        $report->state = $request->estado;
        $report->save();

        // Devuelve una respuesta exitosa
        return response()->json(['message' => 'Estado del reporte actualizado correctamente'], 200);
    } catch (\Exception $e) {
        // Captura y maneja cualquier excepción que pueda ocurrir
        return response()->json(['error' => 'Error al cambiar el estado del reporte: ' . $e->getMessage()], 500);
    }
}

protected function checkUserRole($allowedRoles)
{
    if (!Auth::check()) {
        // El usuario no está autenticado
        abort(401, 'Unauthorized');
    }

    $user = Auth::user();

    if (!in_array($user->role_id, $allowedRoles)) {
        // El usuario no tiene uno de los roles permitidos
        abort(403, 'Access denied');
    }
}
}
