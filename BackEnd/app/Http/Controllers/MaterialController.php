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
            // Verificar si el usuario está autenticado
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido
            $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido

            // Validar los datos de entrada del formulario
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

            // Convertir la fecha al formato adecuado para la base de datos
            $high_date = date('Y-m-d', strtotime($request->input('high_date')));

            // Obtener el prefijo del nombre del material
            $nameMaterial = substr($request->input('name'), 0, 4);

            // Obtener la cantidad de materiales con el mismo prefijo
            $count = Material::where('name', 'like', $nameMaterial . '_%')->count() + 1;

            // Verificar si ya existe un material con el mismo nombre
            $existingMaterial = Material::where('name', $request->input('name'))->first();
            if ($existingMaterial) {
                return response()->json(['error' => 'Ya existe un material con el mismo nombre'], 400);
            }

            // Crear una nueva instancia del material y asignar los valores
            $material = new Material();
            $material->name = ucfirst($request->input('name') . '_' . str_pad($count, 3, '0', STR_PAD_LEFT));
            $material->high_date = $high_date;
            $material->branch_office_id = $request->input('branch_office_id');
            $material->state = $request->input('state');

            // Guardar el material en la base de datos
            $material->save();

            // Obtener los valores de los atributos y asociarlos al material
            $attributes = [];
            foreach ($request->input('attributeCategoryMaterials') as $pivotData) {
                $attributes[] = new AttributeCategoryMaterial([
                    'category_id' => $pivotData['category_id'],
                    'attribute_id' => $pivotData['attribute_id'],
                    'value' => $pivotData['value']
                ]);
            }

            // Guardar los atributos asociados al material
            $material->attributeCategoryMaterials()->saveMany($attributes);

            // Devolver una respuesta de éxito
            return response()->json(['message' => 'Material agregado con éxito'], 201);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al agregar material: ' . $e->getMessage()], 500);
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

    public function editMaterial(Request $request, $materialId)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido
            $this->checkUserRole(['1']); // Cambia '1' por el ID del rol permitido

            // Validar los datos de entrada del formulario
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

            // Convertir las fechas al formato adecuado para la base de datos
            $high_date = date('Y-m-d H:i:s', strtotime($request->input('high_date')));
            $low_date = $request->input('low_date') ? date('Y-m-d H:i:s', strtotime($request->input('low_date'))) : null;

            // Obtener el material existente por ID
            $material = Material::findOrFail($materialId);

            // Actualizar los atributos del material
            $material->name = $request->input('name');
            $material->high_date = $high_date;
            $material->low_date = $low_date;
            $material->branch_office_id = $request->input('branch_office_id');
            $material->state = $request->input('state');

            // Guardar los cambios en el material
            $material->save();

            // Sincronizar los atributos asociados al material
            foreach ($request->input('attributeCategoryMaterials') as $attributeCategoryMaterialData) {
                $attributeId = $attributeCategoryMaterialData['attribute_id'];
                $categoryId = $attributeCategoryMaterialData['category_id'];
                $value = $attributeCategoryMaterialData['value'];

                // Buscar el registro existente por attribute_id, category_id y material_id
                $existingRecord = AttributeCategoryMaterial::where('material_id', $materialId)
                    ->where('attribute_id', $attributeId)
                    ->where('category_id', $categoryId)
                    ->first();

                if ($existingRecord) {
                    // Actualizar el valor del atributo existente
                    $existingRecord->value = $value;
                    $existingRecord->save();
                } else {
                    // Si no existe un registro, crear uno nuevo
                    $newRecord = new AttributeCategoryMaterial();
                    $newRecord->material_id = $materialId;
                    $newRecord->attribute_id = $attributeId;
                    $newRecord->category_id = $categoryId;
                    $newRecord->value = $value;
                    $newRecord->save();
                }
            }

            // Devolver una respuesta de éxito
            return response()->json(['message' => 'Material actualizado con éxito'], 200);
        } catch (\Exception $e) {
            // Capturar y manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al editar material: ' . $e->getMessage()], 500);
        }
    }


    public function deleteMaterial(Request $request, $id)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            //dd($user->role_id);
            if (!$user) {
                return response()->json(['error' => 'Empleado no autenticado'], 401);
            }

            // Verificar si el usuario tiene el rol permitido para editar empleados (rol '1' para administrador)
            $this->checkUserRole(['1']);

            // Buscar al usuario por su ID
            $material = Material::find($id);

            // Si no se encuentra al usuario devuelve un error 404
            if (!$material) {
                return response()->json(['error' => 'Material no encontrado'], 404);
            }

            // Eliminar al usuario
            $material->delete();

            return response()->json(['message' => 'Material eliminado correctamente'], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
}
