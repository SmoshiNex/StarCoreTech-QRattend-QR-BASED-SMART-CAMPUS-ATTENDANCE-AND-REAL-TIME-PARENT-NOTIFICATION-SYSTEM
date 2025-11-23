<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\TeacherPasswordResetController;
use App\Http\Controllers\Auth\TeacherAuthController;
use App\Http\Controllers\TeacherClassController;
use App\Http\Controllers\StudentClassController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ReportsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Teacher Routes
Route::get('/teacher/login', function() {
    return redirect('/')->with('tab', 'teacher');
})->name('teacher.login.page');
Route::post('/teacher/login', [TeacherAuthController::class, 'login'])->name('teacher.post.login');

// Student redirect helper
Route::get('/student/login', function() {
    return redirect('/')->with('tab', 'student');
})->name('student.login.page');

// Teacher Password Reset Routes
Route::get('/teacher/reset-password', [TeacherPasswordResetController::class, 'showResetForm'])
    ->name('teacher.password.reset');
Route::post('/teacher/reset-password', [TeacherPasswordResetController::class, 'reset'])
    ->name('teacher.password.update');

// Teacher Routes Group
Route::middleware('auth:teacher')->group(function () {
    // Dashboard
    Route::get('/teacher/dashboard', [TeacherAuthController::class, 'dashboard'])->name('teacher.dashboard');
    
    // Classes
    Route::get('/teacher/classes', [TeacherClassController::class, 'index'])->name('teacher.classes');
    Route::post('/teacher/classes', [TeacherClassController::class, 'store'])->name('teacher.classes.store');
    Route::patch('/teacher/classes/{class}', [TeacherClassController::class, 'update'])->name('teacher.classes.update');
    Route::delete('/teacher/classes/{class}', [TeacherClassController::class, 'destroy'])->name('teacher.classes.destroy');
    Route::get('/teacher/classes/{class}/students', [TeacherClassController::class, 'getStudents'])->name('teacher.classes.students');
    Route::get('/teacher/classes/{class}/active-session', [TeacherClassController::class, 'getActiveSession'])->name('teacher.classes.active-session');
    
    // Attendance
    Route::post('/teacher/classes/{class}/attendance/start', [AttendanceController::class, 'startSession'])->name('teacher.attendance.start');
    Route::post('/teacher/attendance/{session}/end', [AttendanceController::class, 'endSession'])->name('teacher.attendance.end');
    Route::get('/teacher/attendance/{session}/live', [AttendanceController::class, 'getLiveAttendance'])->name('teacher.attendance.live');
    
    // Reports routes
    Route::get('/teacher/reports', [ReportsController::class, 'index'])->name('teacher.reports');
    Route::get('/teacher/reports/export', [ReportsController::class, 'export'])->name('teacher.reports.export');
    
    // Notifications
    Route::get('/teacher/notifications', [\App\Http\Controllers\NotificationController::class, 'teacherNotifications'])->name('teacher.notifications');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

// Student Routes Group
Route::middleware('auth:student')->group(function () {
    // My Classes
    Route::get('/student/my-classes', [StudentClassController::class, 'myClasses'])->name('student.classes');
    // Attendance History
    Route::get('/student/attendance-history', [StudentClassController::class, 'attendanceHistory'])->name('student.attendance.history');
    // Notifications
    Route::get('/student/notifications', [StudentClassController::class, 'notifications'])->name('student.notifications');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

// Public routes for QR code scanning and class registration (can be accessed before login)
Route::get('/student/register-class/{class}', [StudentClassController::class, 'showRegistration'])->name('student.classes.show');
Route::post('/student/register-class/{class}', [StudentClassController::class, 'register'])->name('student.classes.register');
Route::get('/attendance/scan/{session}', [AttendanceController::class, 'scanQR'])->name('attendance.scan');

require __DIR__.'/auth.php';
