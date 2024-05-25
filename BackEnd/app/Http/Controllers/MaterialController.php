<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use App\Models\Material;
use App\Models\AttributeCategoryMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

class MaterialController extends Controller
{
    public function addMaterial(Request $request)
    {
        try {
            // Check if the user is authenticated
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }
    
            // Check if the user has the allowed role
            $this->checkUserRole(['1']); // Change '1' to the ID of the allowed role
    
            // Validate form input data
            $validator = Validator::make($request->all(), [
                'name' => 'required|string',
                'high_date' => 'required|date',
                'branch_office_id' => 'required|exists:branch_offices,id',
                'state' => 'required|string',
                'attributeCategoryMaterials.*.category_id' => 'required|exists:categories,id',
                'attributeCategoryMaterials.*.attribute_id' => 'required|exists:attributes,id',
                'attributeCategoryMaterials.*.value' => 'required|string',
            ]);
    
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }
    
            // Convert date to the appropriate format for the database
            $high_date = date('Y-m-d', strtotime($request->input('high_date')));
    
            // Get the prefix of the material name
            $nameMaterial = substr($request->input('name'), 0, 4);
    
            // Get the count of materials with the same prefix
            $count = Material::where('name', 'like', $nameMaterial . '_%')->count() + 1;
    
            // Check if a material with the same name already exists
            $existingMaterial = Material::where('name', $request->input('name'))->first();
            if ($existingMaterial) {
                return response()->json(['error' => 'Ya existe un material con el mismo nombre'], 400);
            }
    
            // Create a new instance of the material and assign values
            $material = new Material();
            $material->name = ucfirst($request->input('name') . '_' . str_pad($count, 3, '0', STR_PAD_LEFT));
            $material->high_date = $high_date;
            $material->branch_office_id = $request->input('branch_office_id');
            $material->state = $request->input('state');
    
            // Save the material in the database
            $material->save();
    
            // Get attribute values and associate them with the material
            $attributes = [];
            foreach ($request->input('attributeCategoryMaterials') as $pivotData) {
                $attributes[] = new AttributeCategoryMaterial([
                    'category_id' => $pivotData['category_id'],
                    'attribute_id' => $pivotData['attribute_id'],
                    'value' => $pivotData['value']
                ]);
            }
    
            // Save attributes associated with the material
            $material->attributeCategoryMaterials()->saveMany($attributes);
    
            // Return success response
            return response()->json(['message' => 'Material agregado con éxito'], 201);
        } catch (\Exception $e) {
            // Catch and handle any exceptions that may occur
            return response()->json(['error' => 'Error al agregar material: ' . $e->getMessage()], 500);
        }
    }


   protected function checkUserRole($allowedRoles)
{
    if (!Auth::check()) {
        // User is not authenticated
        abort(401, 'Unauthorized');
    }

    $user = Auth::user();

    if (!in_array($user->role_id, $allowedRoles)) {
        // User does not have one of the allowed roles
        abort(403, 'Access denied');
    }
}

public function editMaterial(Request $request, $materialId)
{
    try {
        // Check if the user is authenticated
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated user'], 401);
        }

        // Check if the user has the allowed role
        $this->checkUserRole(['1']); // Change '1' to the ID of the allowed role

        // Validate the form input data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'high_date' => 'required|date',
            'low_date' => 'nullable|date',
            'branch_office_id' => 'required|exists:branch_offices,id',
            'state' => 'required|string',
            'attributeCategoryMaterials.*.category_id' => 'required|exists:categories,id',
            'attributeCategoryMaterials.*.attribute_id' => 'required|exists:attributes,id',
            'attributeCategoryMaterials.*.value' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // Convert dates to the appropriate format for the database
        $high_date = date('Y-m-d H:i:s', strtotime($request->input('high_date')));
        $low_date = $request->input('low_date') ? date('Y-m-d H:i:s', strtotime($request->input('low_date'))) : null;

        // Get the existing material by ID
        $material = Material::findOrFail($materialId);

        // Update the material attributes
        $material->name = $request->input('name');
        $material->high_date = $high_date;
        $material->low_date = $low_date;
        $material->branch_office_id = $request->input('branch_office_id');
        $material->state = $request->input('state');

        // Save the changes to the material
        $material->save();

        // Sync the attributes associated with the material
        foreach ($request->input('attributeCategoryMaterials') as $attributeCategoryMaterialData) {
            $attributeId = $attributeCategoryMaterialData['attribute_id'];
            $categoryId = $attributeCategoryMaterialData['category_id'];
            $value = $attributeCategoryMaterialData['value'];

            // Find the existing record by attribute_id, category_id, and material_id
            $existingRecord = AttributeCategoryMaterial::where('material_id', $materialId)
                ->where('attribute_id', $attributeId)
                ->where('category_id', $categoryId)
                ->first();

            if ($existingRecord) {
                // Update the value of the existing attribute
                $existingRecord->value = $value;
                $existingRecord->save();
            } else {
                // If a record doesn't exist, create a new one
                $newRecord = new AttributeCategoryMaterial();
                $newRecord->material_id = $materialId;
                $newRecord->attribute_id = $attributeId;
                $newRecord->category_id = $categoryId;
                $newRecord->value = $value;
                $newRecord->save();
            }
        }

        // Return a success response
        return response()->json(['message' => 'Material updated successfully'], 200);
    } catch (\Exception $e) {
        // Catch and handle any exceptions that may occur
        return response()->json(['error' => 'Error editing material: ' . $e->getMessage()], 500);
    }
}


public function deleteMaterial(Request $request, $id)
{
    try {
        // Check if the user is authenticated
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated employee'], 401);
        }

        // Check if the user has the allowed role to delete materials (role '1' for administrator)
        $this->checkUserRole(['1']);

        // Find the material by its ID
        $material = Material::find($id);

        // If the material is not found, return a 404 error
        if (!$material) {
            return response()->json(['error' => 'Material not found'], 404);
        }

        // Delete the material
        $material->delete();

        return response()->json(['message' => 'Material deleted successfully'], 200);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Internal server error'], 500);
    }
}
}
