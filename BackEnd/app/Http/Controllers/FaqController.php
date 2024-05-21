<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

class FaqController extends Controller
{   

    public function getFaqsDetails()
    {
        try {
            // Verificar si el usuario está autenticado
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }
    
            // Verificar si el usuario tiene el rol permitido
            $this->checkUserRole(['1']);
    
            // Obtener todas las FAQs
            $faqs = Faq::all(['titulo', 'descripcion']);
    
         // Log para depuración
         Log::info('FAQs obtenidas:', ['faqs' => $faqs]);

         // Verificación de datos obtenidos
         if ($faqs->isEmpty()) {
             Log::warning('No se encontraron FAQs en la base de datos');
         }
 
         // Devolver las FAQs
         return response()->json(['faqs' => $faqs], 200);
     } catch (\Exception $e) {
         // Capturar y manejar cualquier excepción que pueda ocurrir
         Log::error('Error al obtener FAQs: ' . $e->getMessage());
         return response()->json(['error' => 'Error al obtener FAQs: ' . $e->getMessage()], 500);
     }
    
    }



    public function createFaq(Request $request)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Validar los datos de entrada del formulario
            $validator = Validator::make($request->all(), [
            'faq.title' => 'required|string',
            'faq.description' => 'required|date',
             ]);

             if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }
    
             // Verificar si el usuario tiene el rol permitido
             $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido

             $data = $request->validate([
                'titulo' => 'required|string',
                'descripcion' => 'required|string',
            ]);
        
            $faq = Faq::create($data);

            return response()->json(['faq' => $faq], 201);
        
        
            } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al agregar material: ' . $e->getMessage()], 500);
        }

    }


    public function up()
    {
        Schema::create('faq', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descripcion');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('faq');
    }


    

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
   

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, $id)
{
    try {
        $faq = Faq::find($id);
        if (!$faq) {
            return response()->json(['error' => 'FAQ not found'], 404);
        }

        $data = $request->validate([
            'titulo' => 'required|string',
            'descripcion' => 'required|string',
        ]);

        $faq->update($data);

        return response()->json(['faq' => $faq], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error updating FAQ: ' . $e->getMessage()], 500);
    }
}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function delete($id)
{
    try {
        $faq = Faq::find($id);
        if (!$faq) {
            return response()->json(['error' => 'FAQ not found'], 404);
        }

        $faq->delete();

        return response()->json(['message' => 'FAQ deleted successfully'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error deleting FAQ: ' . $e->getMessage()], 500);
    }
}

    private function checkUserRole(array $allowedRoles)
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
