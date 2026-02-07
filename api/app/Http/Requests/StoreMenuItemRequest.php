<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // add role check if needed
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
            ],

            'price' => [
                'required',
                'integer',
                'min:1', // at least 1 paise
            ],

            'item_ordered' => [
                'sometimes',
                'integer',
                'min:0', // count can’t be negative
            ],

            'is_available' => [
                'sometimes',
                'boolean',
            ],

            'img' => [
                'required',
                'image',                 // jpeg, png, jpg, gif, webp
                'mimes:jpg,jpeg,png,webp',
                'max:2048',              // KB → 2MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Item name is required.',
            'price.integer' => 'Price must be in paise.',
            'item_ordered.integer' => 'Item count must be a number.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->mergeIfMissing([
            'item_ordered' => 0,
            'is_available' => 1,
        ]);

        $this->merge([
            'is_available' => $this->boolean('is_available'),
        ]);
    }
}
