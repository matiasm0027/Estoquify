<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\BranchOffice;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

class EmployeesController extends Controller
{

    public function listEmployees(Request $request)
    {
        try {
            // Get the authenticated user's ID
            $user = $request->user()->id;
    
            // Retrieve employees with their related department, branch office, and role,
            // excluding the authenticated user, and order them by name and last name
            $employees = Employee::with('department', 'branchOffice', 'role')
                ->where('id', '!=', $user)
                ->orderBy('name')
                ->orderBy('last_name')
                ->get();
    
            // Return a JSON response with the retrieved employees
            return response()->json($employees);
        } catch (ThrottleRequestsException $e) {
            // Handle the case of too many requests
            return response()->json(['error' => 'Too many requests. Please try again later.'], 429);
        }
    }
    
    
    public function addEmployee(Request $request)
    {
        try {
            // Check if the user is authenticated
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated user'], 401);
            }
    
            // Check if the user has the allowed role to add employees (role '1' for administrator)
            $this->checkUserRole(['1']);
    
            // Validate the input data from the form
            $validatedData = $request->validate([
                'name' => 'required',
                'last_name' => 'required',
                'email' => 'required|email',
                'phone_number' => 'required',
                'password' => 'required',
                'department_id' => 'required',
                'role_id' => 'required',
                'branch_office_id' => 'required',
            ]);
    
            // Check if the email is already in use
            if (Employee::where('email', $validatedData['email'])->exists()) {
                return response()->json(['error' => 'Email is already in use. Please enter a different email.'], 400);
            }
    
            // Create a new Employee object and assign the values
            $employee = new Employee();
            $employee->name = ucwords(strtolower($validatedData['name']));
            $employee->last_name = ucwords(strtolower($validatedData['last_name']));
            $employee->email = strtolower($validatedData['email']);
            $employee->phone_number = $validatedData['phone_number'];
            $employee->password = bcrypt($validatedData['password']); // Encrypt the password
            $employee->department_id = $validatedData['department_id'];
            $employee->branch_office_id = $validatedData['branch_office_id'];
            $employee->role_id = $validatedData['role_id'];
    
            // Save the new employee to the database
            $employee->save();
    
            // Return a success response
            return response()->json(['message' => 'Employee added successfully'], 201);
        } catch (\Exception $e) {
            // Catch and handle any other exceptions that may occur
            return response()->json(['error' => 'Error adding employee: ' . $e->getMessage()], 500);
        }
    }
    
    public function editEmployee(Request $request, $id)
    {
        try {
            // Check if the user is authenticated
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated user'], 401);
            }
    
            // Check if the user has the allowed role to edit employees (role '1' for administrator)
            $this->checkUserRole(['1']);
    
            // Validate the input data from the form using validate
            $validatedData = $request->validate([
                'name' => 'required',
                'last_name' => 'required',
                'email' => 'required|email',
                'phone_number' => 'required',
                'department_id' => 'required',
                'role_id' => 'required',
                'branch_office_id' => 'required',
            ]);
    
            // Find the employee by ID
            $employee = Employee::find($id);
    
            if (!$employee) {
                return response()->json(['error' => 'Employee not found'], 404);
            }
    
            // Check if the email is already in use by another employee
            if ($validatedData['email'] !== $employee->email && Employee::where('email', $validatedData['email'])->exists()) {
                return response()->json(['error' => 'Email is already in use. Please enter a different email.'], 400);
            }
    
            // Update the employee data with the validated values
            $employee->name = $validatedData['name'];
            $employee->last_name = $validatedData['last_name'];
            $employee->email = $validatedData['email'];
            $employee->department_id = $validatedData['department_id'];
            $employee->branch_office_id = $validatedData['branch_office_id'];
            $employee->role_id = $validatedData['role_id'];
            $employee->phone_number = $validatedData['phone_number'];
    
            // Save the changes to the database
            $employee->save();
    
            // Return a success response
            return response()->json(['message' => 'Employee edited successfully'], 200);
        } catch (\Exception $e) {
            // Catch and handle any exceptions that may occur
            return response()->json(['error' => 'Error editing employee: ' . $e->getMessage()], 500);
        }
    }
    

    public function deleteEmployees(Request $request, $id)
    {
        try {
            // Check if the user is authenticated
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated employee'], 401);
            }
    
            // Check if the user has the allowed role to delete employees (role '1' for administrator)
            $this->checkUserRole(['1']);
    
            // Find the employee by their ID
            $employee = Employee::find($id);
    
            // If the employee is not found, return a 404 error
            if (!$employee) {
                return response()->json(['error' => 'Employee not found'], 404);
            }
    
            // Get the name of the employee for response message
            $employeeName = $employee->name . ' ' . $employee->last_name;
    
            // Delete the employee
            $employee->delete();
    
            // Return success message
            return response()->json(['message' => "Employee {$employeeName} deleted successfully"], 200);
        } catch (\Exception $e) {
            // Catch and handle any exceptions that may occur
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
    
    public function listEmployeesByBranchOffice(Request $request, $id_branch_office)
    {
        try {
            // Get the authenticated user's ID
            $user = $request->user()->id;
    
            // Retrieve employees with their related department and branch office,
            // excluding the authenticated user, and filter by branch office ID
            $employees = Employee::with('department', 'branchOffice')
                ->where('id', '!=', $user)
                ->select('id', 'name', 'last_name', 'email', 'department_id', 'branch_office_id')
                ->where('branch_office_id', $id_branch_office)
                ->get()
                ->map(function ($employee) {
                    // Map the retrieved data to customize the response
                    return [
                        'id' => $employee->id,
                        'name' => $employee->name,
                        'last_name' => $employee->last_name,
                        'email' => $employee->email,
                        'department' => $employee->department ? $employee->department->name : null,
                        'branch_office' => $employee->branchOffice ? $employee->branchOffice->name : null,
                    ];
                });
    
            // Return JSON response with filtered employees
            return response()->json($employees);
        } catch (ThrottleRequestsException $e) {
            // Handle the case of too many requests
            return response()->json(['error' => 'Too many requests. Please try again later.'], 429);
        }
    }
    
    public function getEmployeesByBranchOffice()
    {
        try {
            // Get the number of employees per branch office
            $employeesByBranchOffice = BranchOffice::withCount('employee')->get(['id', 'name', 'employees_count']);
    
            // Return JSON response with employee count per branch office
            return response()->json($employeesByBranchOffice);
        } catch (\Exception $e) {
            // Catch and handle any exceptions that may occur
            return response()->json(['error' => 'Error getting the number of employees per branch office'], 500);
        }
    }
    
    protected function checkUserRole($allowedRoles)
    {
        try {
            // Check if the user is authenticated
            if (!Auth::check()) {
                // The user is not authenticated, return 401 Unauthorized
                abort(401, 'Unauthorized');
            }
    
            // Get the authenticated user
            $user = Auth::user();
    
            // Check if the user's role is allowed
            if (!in_array($user->role_id, $allowedRoles)) {
                // The user's role is not allowed, return 403 Forbidden
                abort(403, 'Access denied');
            }
        } catch (\Exception $e) {
            // Catch and handle any exceptions that may occur
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
}
