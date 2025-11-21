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
            ->withCount('students as students_enrolled')
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

    public function getStudents(TeacherClass $class)
    {
        $this->authorize('update', $class);

        $students = $class->students()
            ->select('students.id', 'students.student_id', 'students.first_name', 'students.last_name')
            ->orderBy('students.last_name')
            ->get();

        return response()->json($students);
    }

    public function getActiveSession(TeacherClass $class)
    {
        $this->authorize('update', $class);

        $session = $class->attendanceSessions()
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->latest()
            ->first();

        return response()->json([
            'session' => $session,
        ]);
    }
}