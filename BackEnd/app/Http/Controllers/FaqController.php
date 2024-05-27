<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use App\Models\Faq;


class FaqController extends Controller
{   

/**
 * Get details of all FAQs.
 *
 * @return \Illuminate\Http\JsonResponse
 */
public function getFaqsDetails()
{
    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'Unauthorized user'], 401);
    }

    // Check if the user has the required role
    $this->checkUserRole(['1', '2', '3']); // Change '1' to the ID of the allowed role

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
        return response()->json(['error' => 'Error getting FAQs: ' . $e->getMessage()], 500);
    }
}

/**
 * Create a new FAQ.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\JsonResponse
 */
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
        return response()->json(['error' => 'Error creating FAQ: ' . $e->getMessage()], 500);
    }
}

/**
 * Edit an existing FAQ.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  int  $id
 * @return \Illuminate\Http\JsonResponse
 */
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
        $faq->title = $request->input('titulo');
        $faq->description = $request->input('descripcion');
        $faq->save();
        
        return response()->json(['faq' => $faq], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error editing FAQ: ' . $e->getMessage()], 500);
    }
}

/**
 * Delete an existing FAQ.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  int  $id
 * @return \Illuminate\Http\JsonResponse
 */
public function deleteFaq(Request $request, $id)
{
    try {
        $faq = Faq::find($id);
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
