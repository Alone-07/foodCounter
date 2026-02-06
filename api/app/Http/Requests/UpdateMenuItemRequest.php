<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|nullable|string',
            'price' => 'sometimes|nullable|integer|min:1',
            'item_ordered' => 'sometimes|nullable|integer|min:0',
            'is_available' => 'sometimes|nullable|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('is_available')) {
            $this->merge([
                'is_available' => $this->boolean('is_available'),
            ]);
        }
    }
}
