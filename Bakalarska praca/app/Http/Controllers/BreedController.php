<?php

namespace App\Http\Controllers;
use App\Models\Breed;
use App\Models\BreedNonStandart;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class BreedController extends Controller
{
    public function index()
    {
        $breed = Breed::all();
        $breedNonStandard = BreedNonStandart::all();

        $breeds = $breed->concat($breedNonStandard);

        return $breeds;
    }

    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'ems' => 'required|string|max:15',
            'english' => 'required|string|max:150',
            'german' => 'sometimes|nullable|string|max:150',
            'french' => 'sometimes|nullable|string|max:150',
            'slovak' => 'sometimes|nullable|string|max:150',
            'czech' => 'sometimes|nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }
        $code = Breed::where('ems',$request['ems'])->first();
        if($code !== null){
            return response(['message' => 'breed is standard']);
        }
        $nonStandardCode = BreedNonStandart::where('ems',$request['ems'])->first();
        if($nonStandardCode !== null){
            return response(['message' => 'breed is non-standard']);
        }

        $ems = BreedNonStandart::create([
            'ems' => $request['ems'],
            'english' => $request['english'],
            'german' => $request['german'],
            'french' => $request['french'],
            'slovak' => $request['slovak'],
            'czech' => $request['czech']
        ]);

        $response = [
            'message' => 'Success',
            'ems' => $ems
        ];
        return response($response);
    }


    public function show(Breed $breed)
    {
        return $breed;
    }

}
