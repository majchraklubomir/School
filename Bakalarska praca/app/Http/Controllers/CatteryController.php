<?php

namespace App\Http\Controllers;

use App\Models\Breed;
use App\Models\Person;
use Illuminate\Http\Request;
use App\Models\Cattery;
use Illuminate\Support\Facades\Validator;

class CatteryController extends Controller
{
    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'owner_id' => 'required|integer',
            'established' => 'sometimes|nullable|date',
            'is_local' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }

        $cattery = Cattery::create([
            'name' => $request['name'],
            'established' => $request['established'],
            'is_local' => $request['is_local']
        ]);

        if ($request->has('breeds')) {
            $values = array_column($request['breeds'], 'breed');
            $uniqueValues = array_unique($values);
            sort($uniqueValues);
            foreach ($uniqueValues as $breed) {
                if (Breed::where('ems', $breed)->first()) {
                    $cattery->catteryBreeds()->create([
                        'breed' => $breed
                    ]);
                }
            }
        }
        $owner = Person::find($request['owner_id']);
        $owner->cattery_id = $cattery->id;
        $owner->save();
        $response = [
            'message' => 'Success',
            'cattery' => $cattery->load('catteryBreeds', 'persons')
        ];
        return response($response);
    }

    public function showName($name){
        $cattery = Cattery::with('persons', 'persons.addresses', 'catteryBreeds');
        $cattery->where('name', 'LIKE', "%{$name}%");

        $results = $cattery->get();
        $data = [];
        foreach ($results as $cattery) {
            $data = $this->reformatAdress($cattery, $data);
        }

        return $data;
    }
    public function showId($id){
        $cattery = Cattery::with('persons', 'persons.addresses', 'catteryBreeds')->find($id);

        $address = null;
        if (isset($cattery->persons) && count($cattery->persons) > 0 && isset($cattery->persons[0]->addresses) && count($cattery->persons[0]->addresses) > 0) {
            $address = $cattery->persons[0]->addresses;
        }
        foreach ($cattery->persons as $person) {
            unset($person->addresses);
        }

        $data = [
            'id' => $cattery->id,
            'name' => $cattery->name,
            'established' => $cattery->established,
            'is_local' => $cattery->is_local,
            'address' => $address,
            'persons' => $cattery->persons,
            'breeds' => $cattery->catteryBreeds->pluck('breed')->toArray(),
        ];
        return $data;
    }

    public function update(Request $request, $id){
        $cattery = Cattery::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|nullable|string|max:150',
            'owner_id' => 'sometimes|nullable|integer',
            'established' => 'sometimes|nullable|date',
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }

        $updatedFields = $request->only([
            'name',
            'owner_id',
            'established'
        ]);
        if (!empty($updatedFields)) {
            $cattery->update($updatedFields);
        }
        if($request->has('owner_id')){
            $owner = Person::find($request['owner_id']);
            $owner->cattery_id = $cattery->id;
            $owner->save();
        }
        if ($request->has('breeds')) {
            $breeds = $request['breeds'];
            $breedIds = [];
            foreach ($breeds as $breed) {
                $name = $breed['breed'];
                $breedIds[] = $name;
                $existingBreed = $cattery->catteryBreeds()->where('breed', $name)->first();
                if (!$existingBreed && Breed::where('ems', $breed)->first()) {
                    $cattery->catteryBreeds()->create([
                        'breed' => $name
                    ]);
                }
            }
            $cattery->catteryBreeds()
                ->whereNotIn('breed', $breedIds)
                ->delete();
        }
        $response = [
            'message' => 'Success',
            'cattery' => $cattery->load('catteryBreeds')
        ];
        return response($response);
    }

    public function filter(Request $request){
        $cattery = Cattery::with('persons.addresses', 'catteryBreeds');
        if ($request->has('name') && $request['name'] !== null){
            $cattery->where('name', 'LIKE', "%{$request['name']}%");
        }

        if ($request->has('breeds') && !empty($request->breeds)){
            $breeds = collect($request->breeds)->pluck('breed')->toArray();
            $cattery->whereHas('catteryBreeds', function($query) use ($breeds) {
                $query->whereIn('breed', $breeds);
            });
        }

        if ($request->has('breeder_last_name') && $request['breeder_last_name'] !== null){
            $cattery->whereHas('persons', function($query) use ($request) {
                $query->where('last_name', 'LIKE', "%{$request['breeder_last_name']}%");
            });
        }

        if ($request->has('address') && $request['address'] !== null){
            $cattery->whereHas('persons', function($query) use ($request) {
                $query->whereHas('addresses', function($query) use ($request) {
                    $query->where('city', 'LIKE', "%{$request['address']}%");
                });
            });
        }

        $results = $cattery->get();

        $data = [];

        foreach ($results as $cattery) {
            $data = $this->reformatAdress($cattery, $data);
        }

        return $data;
    }

//    public function destroy($id){
//        $cattery = Cattery::find($id);
//        $cattery->delete();
//    }
    /**
     * @param \Illuminate\Database\Eloquent\Model|\Illuminate\Database\Eloquent\Collection|\Illuminate\Database\Eloquent\Builder|array|null $cattery
     * @param array $data
     * @return array
     */
    private function reformatAdress(\Illuminate\Database\Eloquent\Model|\Illuminate\Database\Eloquent\Collection|\Illuminate\Database\Eloquent\Builder|array|null $cattery, array $data): array
    {
        $address = null;
        if (isset($cattery->persons) && count($cattery->persons) > 0 && isset($cattery->persons[0]->addresses) && count($cattery->persons[0]->addresses) > 0) {
            $address = $cattery->persons[0]->addresses;
        }
        foreach ($cattery->persons as $person) {
            unset($person->addresses);
        }

        $data[] = [
            'id' => $cattery->id,
            'name' => $cattery->name,
            'established' => $cattery->established,
            'is_local' => $cattery->is_local,
            'address' => $address,
            'persons' => $cattery->persons,
            'breeds' => $cattery->catteryBreeds->pluck('breed')->toArray(),
        ];
        return $data;
    }
}
