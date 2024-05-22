<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function crearConexion(Request $request)
    {
        $validatedData = $request->validate([
            'sender' => 'required|string|max:255',
            'receiver' => 'required|string|max:255',
        ]);

        // Crear la fila en la tabla de chats con los datos proporcionados
        $chat = new Chat();
        $chat->sender = $request->sender;
        $chat->receiver = $request->receiver;
        $chat->message = ''; // Mensaje vacío por defecto
        $chat->save();

        // Devolver una respuesta adecuada, por ejemplo, el chat recién creado
        return response()->json($chat, 201);
    }
}
