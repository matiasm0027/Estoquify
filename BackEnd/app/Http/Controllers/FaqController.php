<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use App\Models\Faq;


class FaqController extends Controller
{   

     // Obtener detalles de todas las FAQs
     public function getFaqsDetails()
{
    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'Usuario no autenticado'], 401);
    }

    // Verificar si el usuario tiene el rol permitido
    $this->checkUserRole(['1','2','3']); // Cambia '1' por el ID del rol permitido

    try {
        $faqs = Faq::all()->map(function ($faq) {
            return [
                'id' => $faq->id,
                'titulo' => $faq->titulo,
                'descripcion' => $faq->descripcion
            ];
        });

        return response()->json(['faqs' => $faqs], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error al obtener FAQs: ' . $e->getMessage()], 500);
    }
}

 
     // Crear una nueva FAQ
     public function createFaq(Request $request)
     {
         try {
             $validator = Validator::make($request->all(), [
                 'titulo' => 'required|string',
                 'descripcion' => 'required|string',
             ]);
 
             if ($validator->fails()) {
                 return response()->json(['error' => $validator->errors()], 400);
             }
 
             $faq = Faq::create($request->all());
             return response()->json(['faq' => $faq], 201);
         } catch (\Exception $e) {
             return response()->json(['error' => 'Error al crear la FAQ: ' . $e->getMessage()], 500);
         }
     }
 
     // Editar una FAQ existente
     public function editFaq(Request $request, $id)
{
    try {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string',
            'descripcion' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $faq = Faq::findOrFail($id);
        $faq->titulo = $request->input('titulo');
        $faq->descripcion = $request->input('descripcion');
        $faq->save();
        
        return response()->json(['faq' => $faq], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error al editar la FAQ: ' . $e->getMessage()], 500);
    }
}

 
     // Eliminar una FAQ existente
     public function deleteFaq(Request $request, $id)
    {
       
    try {
        $faq = Faq::find($id);
        $faq->delete();


        return response()->json(['message' => 'FAQ eliminada correctamente'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error al eliminar la FAQ: ' . $e->getMessage()], 500);
    }
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
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
