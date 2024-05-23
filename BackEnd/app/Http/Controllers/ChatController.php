<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Chat;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Crypt;

class ChatController extends Controller
{
    public function crearConexion(Request $request)
    {
        $validatedData = $request->validate([
            'sender_id' => 'required|integer|exists:employees,id',
            'receiver_id' => 'required|integer|exists:employees,id',
        ]);

        $chat = new Chat();
        $chat->sender_id = $request->sender_id;
        $chat->receiver_id = $request->receiver_id;
        $chat->message = ''; // Mensaje vacío por defecto
        $chat->save();

        return response()->json($chat, 201);
    }

    public function eliminarConexion($senderId)
    {
       
        $this->checkUserRole(['1']);
        // Elimina la conexión
        $conexiones = Chat::where('sender_id', $senderId)->get();

        if ($conexiones->isEmpty()) {
            return response()->json(['error' => 'Conexiones no encontradas'], 404);
        }

        // Eliminar todas las conexiones encontradas
        Chat::where('sender_id', $senderId)->delete();

        return response()->json(['message' => 'Conexiones eliminadas exitosamente']);

        return response()->json(['message' => 'Conexión eliminada exitosamente']);
    }

    public function getActiveChats($employeeId)
    {
        // Asume que tienes una relación en el modelo Chat que relaciona los chats con los empleados
        $chats = Chat::where('sender_id', $employeeId)
                     ->orWhere('receiver_id', $employeeId)
                     ->with(['sender', 'receiver']) // Cargar relaciones si es necesario
                     ->get();

        return response()->json($chats);
    }
    

    protected function checkUserRole($allowedRoles)
    {
        try {
            if (!Auth::check()) {
                // El usuario no está autenticado
                abort(401, 'Unauthorized');
            }

            $user = Auth::user();

            if (!in_array($user->role_id, $allowedRoles)) {
                // El usuario no tiene uno de los roles permitidos
                abort(403, 'Access denied');
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
    public function actualizarMensaje($id, Request $request)
    {
        // Validar los datos de la solicitud
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }
    
        try {
            // Buscar el chat por ID
            $chat = Chat::find($id);
    
            if (!$chat) {
                return response()->json(['error' => 'Chat no encontrado'], 404);
            }
    
            // Actualizar el mensaje
            $chat->message = $request->input('message');
            $chat->save();
    
            return response()->json(['message' => 'Mensaje actualizado exitosamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
}
