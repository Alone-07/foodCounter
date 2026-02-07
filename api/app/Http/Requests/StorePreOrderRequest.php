<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StorePreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
                'distinct',
            ],

            'items.*.menu_item_id' => [
                'required',
                'uuid',
                // uncomment if table exists
                'exists:menu_items,uuid',
            ],

            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ];
    }

    protected function prepareForValidation(): void {
        if ($this->has('items')) {
            $this->merge([
                'items' => collect($this->items)->map(function ($item) {
                    $item['quantity'] = (int) $item['quantity'];
                    return $item;
                })->toArray()
            ]);
        }
    }


    protected function failedValidation(Validator $validator) {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }

}
