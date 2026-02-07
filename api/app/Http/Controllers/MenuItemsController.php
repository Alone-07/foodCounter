<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\StorePreOrderRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Models\MenuItem;
use App\Models\PreOrder;
use App\Models\User;

class MenuItemsController extends Controller
{
    public function createItem(StoreMenuItemRequest $request) {
        $validated = $request->validated();
        
        $img = $request->file('img');
        $path = $img->store('menu-items', 'public');

        MenuItem::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'item_ordered' => $validated['item_ordered'],
            'is_available' => $validated['is_available'],
            'img_url' => $path,
        ]);

        return response()->json([
            'msg' => 'Item created successfully',
        ], 201);
    }

    public function updateItem(MenuItem $item,  UpdateMenuItemRequest $request) {
        $validated = $request->validated();

        $update = [];
        foreach($validated as $key => $value) {
            if($value != NULL) {
                $update[$key] = $value;
            }
        }
        $item->update($validated);

        return response()->json([
            'item' => $item,
            'collection' => $update,
        ]);
    }

    public function deleteItem(MenuItem $item) {
        $item->delete();

        return response()->json('Item deleted.', 200);
    }

    public function listItems() {
        // $items = MenuItem::where('is_available', true)->get();
        $items = MenuItem::get();
        return response()->json($items, 200);
    }

    public function preOrder(StorePreOrderRequest $request) {
        $payload = $request->validated();
        
        $user_data = [
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => 'user@foodCourt',
        ];


        $user = User::create($user_data);

        $items = $payload['items'];

        foreach($items as $item) {
            PreOrder::create([
                'user_id' => $user->id,
                'men_item_id' => $item['menu_item_id'],
                'quantity' => $item['quantity'],
            ]);
        }
        
        return response()->json([
            'payload' => $payload,
            'items' => $items
        ], 201);
    }

    public function getPreOrders() {
        $preOrders = PreOrder::with('user')->get();

        return response()->json($preOrders, 200);
    }

}
