<?php

use App\Http\Controllers\MenuItemsController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('cache-clear', function () {
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('optimize');

    return response()->json("Cache cleared...", 200);
});

Route::get('/check', function () {
    return response()->json("Api running...", 200);
});

Route::post('signup', [UserController::class, 'signup']);
Route::post('login', [UserController::class, 'login']);

Route::get('list-items', [MenuItemsController::class, 'listItems']);

Route::middleware(['auth:sanctum'])->group(function (){
    Route::post('create-item', [MenuItemsController::class, 'createItem']);
    Route::post('update-item/{item}', [MenuItemsController::class, 'updateItem']);
    Route::delete('delete-item/{item}', [MenuItemsController::class, 'deleteItem']);
});

Route::post('pre-order', [MenuItemsController::class, 'preOrder']);
Route::get('pre-orders', [MenuItemsController::class, 'getPreOrders']);


// Route::get('/users', [UserController::class'listUsers']);