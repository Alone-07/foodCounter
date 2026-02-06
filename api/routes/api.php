<?php

use App\Http\Controllers\MenuItemsController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('cache-clear', function () {
    Artisan::call('cache:clear');
    Artisan::call('optimize');

    return response()->json("Cache cleared...", 200);
});

Route::get('/check', function () {
    return response()->json("Api running...", 200);
});

Route::post('sign-up', [UserController::class, 'signUp']);
Route::post('login', [UserController::class, 'login']);

Route::get('list-items', [MenuItemsController::class, 'listItems']);
Route::post('create-item', [MenuItemsController::class, 'createItem']);
Route::put('update-item/{item}', [MenuItemsController::class, 'updateItem']);
Route::delete('delete-item/{item}', [MenuItemsController::class, 'deleteItem']);
