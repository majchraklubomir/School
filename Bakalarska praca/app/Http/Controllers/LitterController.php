<?php

namespace App\Http\Controllers;

use App\Models\Cat;
use App\Models\Cattery;
use App\Models\Litter;
use App\Models\LitterCat;
use App\Models\Person;
use Illuminate\Http\Request;
use Validator;

class LitterController extends Controller
{
    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'father_id' => 'required|integer',
            'mother_id' => 'required|integer',
            'cattery_id' => 'required|integer',
            'type' => 'sometimes|nullable|string|in:RX,LO',
            'birth_date' => 'sometimes|nullable|date',
            'coverage_date' => 'sometimes|nullable|date',
            'license_date' => 'sometimes|nullable|date',
            'marking' => 'sometimes|nullable|string|max:200',
            'breed' => 'required|nullable|string|max:200',
            'born_males' => 'required|nullable|integer',
            'born_females' => 'required|nullable|integer',
            'name_type' => 'required',
            'cats' => 'required|array',
            'cats.name' => 'sometimes|string|max:150',
            'cats.sex' => 'sometimes|string|in:M,F',
            'cats.color' => 'sometimes|string|nullable|max:150',
            'cats.pk_breed_number' => 'sometimes|integer',
            'cats.chip_number' => 'sometimes|string|nullable|max:150',
            'cats.type' => 'sometimes|string|in:PET,BREED,NONE',
            'cats.note' => 'sometimes|string|nullable|max:200'
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }

        $litter = Litter::create([
            'father_id' => $request['father_id'],
            'mother_id' => $request['mother_id'],
            'cattery_id' => $request['cattery_id'],
            'type' => $request['type'],
            'birth_date' => $request['birth_date'],
            'coverage_date' => $request['coverage_date'],
            'license_date' => $request['license_date'],
            'marking' => $request['marking'],
            'breed' => $request['breed'],
            'born_males' => $request['born_males'],
            'born_females' => $request['born_females']
        ]);
        $catteryName = Cattery::where('id', '=', $request['cattery_id'])->value('name');
        $breeder = Person::where('cattery_id', '=', $request['cattery_id'])->first()->value('id');
        $cats = $request['cats'];

        if($request->has('cats') && $request['cats'] !== null){
            foreach ($cats as $cat) {
                $printname = $cat['name']. ' '. $catteryName;
                if($request['name_type'] === 'cattery'){
                    $printname = $catteryName. ' '. $cat['name'];
                }
                $reg_number1 = '(SK) FFS ' . $request['type'] . ' ' . $cat['pk_breed_number'] . '/' . date('Y') . '/' . $request['breed'];
                $identifier = $printname . ' ' . '(' . $request['breed'] . ') ' . $reg_number1;
                $newCat = Cat::create([
                    'identifier' => $identifier,
                    'registration_number_new' => $reg_number1,
                    'chip_number' => $cat['chip_number'],
                    'pk_breed_number' => $cat['pk_breed_number'],
                    'name' => $cat['name'],
                    'printname1' => $printname,
                    'birthdate' => $request['birth_date'],
                    'origin' => 'domestic',
                    'sex' => $cat['sex'],
                    'color' => $cat['color'],
                    'breed' => $request['breed'],
                    'ownershipdate' => $request['birth_date'],
                    'father_id' => $request['father_id'],
                    'mother_id' => $request['mother_id'],
                    'cattery_id' => $request['cattery_id'],
                    'breeder_id' => $breeder
                ]);

                $newLitterCat = LitterCat::create([
                    'cat_id' => $newCat->id,
                    'litter_id' => $litter->id,
                    'name' => $cat['name'],
                    'pk_breed_number' => $cat['pk_breed_number'],
                    'breed' => $request['breed'],
                    'sex' => $cat['sex'],
                    'color' => $cat['color'],
                    'chip_number' => $cat['chip_number'],
                    'type' => $cat['type'],
                    'note' => $cat['note']
                ]);
            }
        }

        $response = [
            'message' => 'Success',
            'litter' => $litter->load('litterCats')
        ];
        return response($response);
    }

    public function show($id)
    {
        $cat = Cat::find($id);
        $litterKey = $cat->sex === 'F' ? 'mother_litter' : 'father_litter';
        if($cat->sex === 'F'){
            $cat->load(['mother_litter', 'mother_litter.litterCats.cat']);
        }elseif($cat->sex === 'M'){
            $cat->load(['father_litter', 'father_litter.litterCats.cat']);
        }
        $catData = $cat->toArray();
        $litters = $catData[$litterKey];
        unset($catData[$litterKey]);
        $catData['litters'] = $litters;
        foreach ($catData['litters'] as &$litter){
            $cats = [];
            foreach ($litter['litter_cats'] as $litterCat){
                $cats[] = $litterCat['cat'];
            }
            unset($litter['litter_cats']);
            $litter['cats'] = $cats;
        }
        return response($catData);
    }

//    public function update(Request $request, $id){
//        $litter = Litter::findOrFail($id);
//        $validator = Validator::make($request->all(), [
//            'type' => 'sometimes|nullable|string|in:RX,LO',
//            'birth_date' => 'sometimes|nullable|date',
//            'coverage_date' => 'sometimes|nullable|date',
//            'license_date' => 'sometimes|nullable|date',
//            'marking' => 'sometimes|nullable|string|max:200',
//            'breed' => 'sometimes|nullable|string|max:200',
//            'born_males' => 'sometimes|nullable|integer',
//            'born_females' => 'sometimes|nullable|integer',
//        ]);
//
//        if ($validator->fails()) {
//            return response([$validator->errors()->all()],422);
//        }
//
//        $litter = Litter::update([
//            'type' => $request['litter_type'],
//            'birth_date' => $request['birth_date'],
//            'coverage_date' => $request['coverage_date'],
//            'license_date' => $request['license_date'],
//            'marking' => $request['marking'],
//            'breed' => $request['breed'],
//            'born_males' => $request['born_males'],
//            'born_females' => $request['born_females']
//        ]);
//
//        $response = [
//            'message' => 'Success',
//            'litter' => $litter
//        ];
//        return response($response);
//    }

}
