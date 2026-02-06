<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Ramsey\Collection\Collection;

use function PHPSTORM_META\type;

class MenuItemsController extends Controller
{
    public function createItem(StoreMenuItemRequest $request) {
        // $validated = $request->validate([
        // 'name' => 'required|string|min:2|max:100',
        // 'price' => 'required|integer|min:1',
        // 'item_ordered' => 'required|integer|min:0',
        // 'is_available' => 'sometimes|boolean',
        // ]);

        // MenuItem::create([
        //     'name' => $validated['name'],
        //     'price' => $validated['price'],
        //     'item_ordered' => $validated['item_ordered'],
        //     'is_available' => $validated['is_available'],
        // ]);

        $validated = $request->validated();

        MenuItem::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'item_ordered' => $validated['item_ordered'],
            'is_available' => $validated['is_available'],
        ]);

        return response()->json([
            'msg' => 'Item created successfully',
        ], 201);
    }

    public function updateItem(MenuItem $item,  UpdateMenuItemRequest $request) {
        $validated = $request->validated();

        $update = [];
        foreach($validated as $key => $value) {
            if($value !== NULL) {
                $update[$key] = $value;
            }
        }
        $item->update($validated);

        return response()->json([
            'item' => $item,
            'colleciton' => $update
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

}
