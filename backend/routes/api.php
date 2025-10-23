<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;


Route::get('/ping', function () {
    return response()->json([
        'ok' => true,
        'time' => now()->toIso8601String(),
    ]);
});

Route::get('/users', function () {
    return User::all();
});