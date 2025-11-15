<?php

namespace App\Http\Controllers;

use App\Models\TeacherClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TeacherClassController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $teacher = Auth::guard('teacher')->user();
        $classes = TeacherClass::where('teacher_id', $teacher->id)
            ->withCount(['students as students_enrolled' => function($query) {
                $query->whereNotNull('class_student.student_id');
            }])
            ->get();

        return Inertia::render('Teacher/MyClasses', [
            'classes' => $classes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_code' => 'required|string|max:255',
            'subject_name' => 'required|string|max:255',
            'schedule' => 'required|string|max:255',
            'room' => 'nullable|string|max:255',
        ]);

        $teacher = Auth::guard('teacher')->user();
        $validated['teacher_id'] = $teacher->id;

        TeacherClass::create($validated);

        return redirect()->back()->with('success', 'Class created successfully');
    }

    public function update(Request $request, TeacherClass $class)
    {
        $this->authorize('update', $class);

        $validated = $request->validate([
            'class_code' => 'required|string|max:255',
            'subject_name' => 'required|string|max:255',
            'schedule' => 'required|string|max:255',
            'room' => 'nullable|string|max:255',
        ]);

        $class->update($validated);

        return redirect()->back()->with('success', 'Class updated successfully');
    }

    public function destroy(TeacherClass $class)
    {
        $this->authorize('delete', $class);
        
        $class->delete();

        return redirect()->back()->with('success', 'Class deleted successfully');
    }
}