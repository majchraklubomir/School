<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PersonController extends Controller
{
    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:45',
            'last_name' => 'required|string|max:45',
            'email' => 'required|email|max:45',
            'titles_before' => 'nullable|string|max:45',
            'titles_after' => 'nullable|string|max:45',
            'phone_number' => 'nullable|string|max:45',
            'note' => 'nullable|string|max:500',
            'address' => 'sometimes|array',
            'address.street' => 'sometimes|nullable|string|max:150',
            'address.city' => 'sometimes|nullable|string|max:150',
            'address.postal' => 'sometimes|nullable|string|max:150',
            'address.state' => 'sometimes|nullable|string|max:150',
            'address.type' => 'sometimes|in:residential,correspondence',
            'addressCorrespondence' => 'sometimes|nullable|array',
            'addressCorrespondence.street' => 'sometimes|nullable|string|max:150',
            'addressCorrespondence.city' => 'sometimes|nullable|string|max:150',
            'addressCorrespondence.postal' => 'sometimes|nullable|string|max:150',
            'addressCorrespondence.state' => 'sometimes|nullable|string|max:150',
            'addressCorrespondence.type' => 'sometimes|in:residential,correspondence',
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }
        $person = Person::create([
            'titles_before' => $request['titles_before'],
            'first_name' => $request['first_name'],
            'last_name' => $request['last_name'],
            'titles_after' => $request['titles_after'],
            'email' => $request['email'],
            'phone_number' => $request['phone_number'],
            'note' => $request['note']
        ]);

        if ($request->has('address')) {
            $person->addresses()->create($request['address']);
        }
        if ($request->has('addressCorrespondence')) {
            $person->addresses()->create($request['addressCorrespondence']);
        }

        $person = $person->fresh();
        $formattedResult = $person->toArray();
        $formattedResult['cattery'] = optional($person->cattery)->toArray();
        $formattedResult['address'] = $person->addresses()->where('type', 'residential')->first();
        $formattedResult['addressCorrespondence'] = $person->addresses()->where('type', 'correspondence')->first();

        return $formattedResult;
    }

    public function update(Request $request, $id) {
        $person = Person::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'cattery_id' => 'nullable|integer',
            'association_id' => 'nullable|integer',
            'first_name' => 'required|string|max:45',
            'last_name' => 'required|string|max:45',
            'email' => 'required|email|max:45',
            'titles_before' => 'nullable|string|max:45',
            'titles_after' => 'nullable|string|max:45',
            'phone_number' => 'nullable|string|max:45',
            'note' => 'nullable|string|max:500',
            'address' => 'sometimes|array',
            'address.street' => 'sometimes|nullable|string|max:150',
            'address.city' => 'sometimes|nullable|string|max:150',
            'address.postal' => 'sometimes|nullable|string|max:150',
            'address.state' => 'sometimes|nullable|string|max:150',
            'address.type' => 'sometimes|in:residential,correspondence',
            'addressCorrespondence' => 'sometimes|nullable|array',
            'addressCorrespondence.street' => 'sometimes|nullable|string|max:150',
            'addressCorrespondence.city' => 'sometimes|nullable|string|max:150',
            'addressCorrespondence.postal' => 'sometimes|nullable|string|max:150',
            'addressCorrespondence.state' => 'sometimes|nullable|string|max:150',
            'addressCorrespondence.type' => 'sometimes|in:residential,correspondence',
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }

        $updatedFields = $request->only(['titles_before', 'first_name', 'last_name', 'titles_after', 'email', 'phone_number', 'note', 'cattery_id', 'association_id']);
        if (!empty($updatedFields)) {
            $person->update($updatedFields);
        }
        if ($request->has('address')) {
            if($person->addresses()->where('type', '=', 'residential')->first()){
                $person->addresses()->where('type', '=', 'residential')->update($request['address']);
            }
            else{
                $person->addresses()->create($request['address']);
            }
        }
        if ($request->has('addressCorrespondence')) {
            if($person->addresses()->where('type', '=', 'correspondence')->first()){
                $person->addresses()->where('type', '=', 'correspondence')->update($request['addressCorrespondence']);
            }
            else{
                $person->addresses()->create($request['addressCorrespondence']);
            }
        }

        $person = $person->fresh();
        $formattedResult = $person->toArray();
        $formattedResult['association'] = optional($person->association)->toArray();
        $formattedResult['cattery'] = optional($person->cattery)->toArray();
        $formattedResult['address'] = $person->addresses()->where('type', 'residential')->first();
        $formattedResult['addressCorrespondence'] = $person->addresses()->where('type', 'correspondence')->first();

        return $formattedResult;
    }
    public function filter(Request $request){
        $person = Person::with('cattery', 'addresses', 'association');

        if ($request->has('first_name') && $request['first_name'] !== null){
            $person->where('first_name', 'LIKE', "%{$request['first_name']}%");
        }

        if ($request->has('last_name') && $request['last_name'] !== null){
            $person->where('last_name', 'LIKE', "%{$request['last_name']}%");
        }

        if ($request->has('email') && $request['email'] !== null){
            $person->where('email', 'LIKE', "%{$request['email']}%");
        }

        if ($request->has('phone') && $request['phone'] !== null){
            $person->where('phone_number', 'LIKE', "%{$request['email']}%");
        }
        if ($request->has('cattery_name') && $request['cattery_name'] !== null){
            $person->whereHas('cattery', function($query) use ($request) {
                $query->where('name', 'LIKE', "%{$request['cattery_name']}%");
            });
        }

        $result = $person->get()->toArray();

        $formattedResult = [];
        foreach($result as $item) {
            $formattedAddress = [
                'address' => null,
                'addressCorrespondence' => null,
            ];
            foreach($item['addresses'] as $address) {
                if($address['type'] === 'residential') {
                    $formattedAddress['address'] = $address;
                }
                if($address['type'] === 'correspondence') {
                    $formattedAddress['addressCorrespondence'] = $address;
                }
            }
            unset($item['addresses']);
            $item = array_merge($item, $formattedAddress);
            $formattedResult[] = $item;
        }
        return $formattedResult;
    }

    public function show($name){
        return Person::where('last_name', 'LIKE', "%{$name}%")->get();
    }

    public function showId($id){
        return Person::with('addresses', 'cattery', 'association')->find($id);
    }

//    public function destroy($id){
//        $person = Person::find($id);
//        $person->delete();
//    }

}
