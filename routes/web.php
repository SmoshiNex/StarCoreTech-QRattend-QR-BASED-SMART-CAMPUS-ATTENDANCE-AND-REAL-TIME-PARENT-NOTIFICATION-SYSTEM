<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\TeacherPasswordResetController;
use App\Http\Controllers\Auth\TeacherAuthController;
use App\Http\Controllers\TeacherClassController;
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
})->name('teacher.login');
Route::post('/teacher/login', [TeacherAuthController::class, 'login'])->name('teacher.post.login');

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
});

require __DIR__.'/auth.php';
