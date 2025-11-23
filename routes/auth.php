<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\StudentAuthController;
use App\Http\Controllers\Auth\TeacherAuthController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    // Unified login (guest only) - handles both teacher and student
    Route::post('login', [\App\Http\Controllers\Auth\UnifiedAuthController::class, 'login'])
        ->name('unified.login');

    // Student login (guest only) - kept for backward compatibility
    Route::post('student/login', [StudentAuthController::class, 'login'])
        ->name('student.login');

    // Teacher login (guest only) - kept for backward compatibility
    Route::post('teacher/login', [TeacherAuthController::class, 'login'])
        ->name('teacher.login');

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

// Student protected routes
Route::middleware('auth:student')->group(function () {
    Route::get('student/dashboard', [StudentAuthController::class, 'dashboard'])
        ->name('student.dashboard');
    Route::post('student/logout', [StudentAuthController::class, 'logout'])
        ->name('student.logout');
});

// Teacher protected routes
Route::middleware('auth:teacher')->group(function () {
    Route::get('teacher/dashboard', [TeacherAuthController::class, 'dashboard'])
        ->name('teacher.dashboard');
    Route::post('teacher/logout', [TeacherAuthController::class, 'logout'])
        ->name('teacher.logout');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
