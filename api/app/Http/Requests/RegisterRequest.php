<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // add role check if needed
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string',
            'email'    => 'required|email',
            'password' => 'required',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->mergeIfMissing([
            'name' => 'Admin',
        ]);
    }
}
