<?php

namespace App\Http\Controllers;

use App\Models\Cat;
use App\Models\CatDocument;
use App\Models\Cattery;
use App\Models\Litter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\BinaryFileResponse;


class CatController extends Controller
{
    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'registration_number_original' => 'nullable|string|max:200',
            'registration_number_other' => 'nullable|string|max:200',
            'chip_number' => 'nullable|string|max:200',
            'title_before' => 'nullable|string|max:200',
            'name' => 'required|string|max:200',
            'title_after' => 'nullable|string|max:200',
            'printname1' => 'nullable|string|max:200',
            'printname2' => 'nullable|string|max:200',
            'birthdate' => 'date',
            'origin' => 'required|in:domestic,imported,exported,recorded',
            'printdate' => 'date',
            'sex' => 'required|in:M,F',
            'color' => 'required|string|max:200',
            'breed' => 'required|string|max:200',
            'ownershipdate' => 'date',
            'father_id' => 'nullable|integer',
            'mother_id' => 'nullable|integer',
            'cattery_id' => 'nullable|integer',
            'cattery_name' => 'sometimes|nullable',
            'breeder_id' => 'nullable|integer',
            'owner_id' => 'nullable|integer',
            'attribute1' => 'nullable|string|max:200',
            'attribute2' => 'nullable|string|max:200',
            'attribute3' => 'nullable|string|max:200',
            'attribute4' => 'nullable|string|max:200',
            'note' => 'nullable|string|max:2000'
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }

        if($request->has('cattery_id') && $request['cattery_id'] !== null){
            $catteryName = Cattery::where('id', '=', $request['cattery_id'])->value('name');
        }elseif($request->has('cattery_name') && $request['cattery_name'] !== null){
            $catteryName = $request['cattery_name'];
        }else{
            $catteryName = null;
        }

        $pkNumber = $this->showBreedNumber($request['breed']);
        $reg_number = '(SK) FFS ' .$pkNumber . '/' . date('Y') . '/' . $request['breed'];
        $identifier = $request['name'] . ' ' . $catteryName . ' ' . '(' . $request['breed'] . ') ' . $reg_number;

        $cat = Cat::create([
            'identifier' => $identifier,
            'registration_number_new' => $reg_number,
            'registration_number_original' => $request['registration_number_original'],
            'registration_number_other' => $request['registration_number_other'],
            'chip_number' => $request['chip_number'],
            'pk_breed_number' => $pkNumber,
            'title_before' => $request['title_before'],
            'name' => $request['name'],
            'title_after' => $request['title_after'],
            'printname1' => $request['printname1'],
            'printname2' => $request['printname2'],
            'birthdate' => $request['birthdate'],
            'origin' => $request['origin'],
            'printdate' => $request['printdate'],
            'sex' => $request['sex'],
            'color' => $request['color'],
            'breed' => $request['breed'],
            'ownershipdate' => $request['ownershipdate'],
            'father_id' => $request['father_id'],
            'mother_id' => $request['mother_id'],
            'cattery_id' => $request['cattery_id'],
            'breeder_id' => $request['breeder_id'],
            'owner_id' => $request['owner_id'],
            'attribute1' => $request['attribute1'],
            'attribute2' => $request['attribute2'],
            'attribute3' => $request['attribute3'],
            'attribute4' => $request['attribute4'],
            'note' => $request['note']
        ]);

        $response = [
            'message' => 'Success',
            'cat' => $cat->fresh()->load('cattery', 'owner', 'breeder')
        ];
        return response($response);
    }

    public function filter(Request $request){
        $cat = Cat::with('cattery', 'owner', 'breeder');
        if ($request->has('name') && $request['name'] !== null){
            $cat->where('identifier', 'LIKE', "%{$request['name']}%");
        }

        if ($request->has('sex') && $request['sex'] !== null){
            $cat->where('sex', '=', $request['sex']);
        }

        if ($request->has('origin') && $request['origin'] !== null){
            $cat->where('origin', '=', $request['origin']);
        }

        if ($request->has('breed') && $request['breed'] !== null){
            $cat->where('breed', '=', $request['breed']);
        }

        if ($request->has('color') && $request['color'] !== null){
            $cat->where('color', 'LIKE', "%{$request['color']}%");
        }

        if ($request->has('cattery_name') && $request['cattery_name'] !== null){
            $cat->whereHas('cattery', function($query) use ($request) {
                $query->where('name', 'LIKE', "%{$request['cattery_name']}%");
            });
        }

        return $cat->get();
    }

    public function filterByIdentifier(Request $request){
        $validator = Validator::make($request->all(), [
            'identifier' => 'required|string|max:200',
            'sex' => 'sometimes|nullable|in:M,F',
            'breed' => 'sometimes|nullable|string|max:200'
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }

        $cat = Cat::where('identifier', 'LIKE', "%{$request['identifier']}%");
        if ($request->has('sex') && $request['sex'] !== null) {
            $cat->where('sex', '=', $request['sex']);
        }

        if ($request->has('breed') && $request['breed'] !== null) {
            $cat->where('breed', '=', $request['breed']);
        }

        $result = $cat->get()->toArray();

        $formattedResult = [];
        foreach($result as $item) {
            $warning = [
                'litter_warning' => false,
            ];
            if($item['sex'] === 'F'){
                $litterCount = Litter::where('mother_id', '=', $item['id'])
                    ->where('birth_date', '>=', now()->subYears(2))
                    ->count();
                if($litterCount > 3) {
                    $warning['litter_warning'] = true;
                }
            }

            $item = array_merge($item, $warning);
            $formattedResult[] = $item;
        }
        return $formattedResult;
    }

    public function update(Request $request, $id){
        $validator = Validator::make($request->all(), [
            'identifier' => 'nullable|string|max:200',
            'registration_number_new' => 'nullable|string|max:200',
            'registration_number_original' => 'nullable|string|max:200',
            'registration_number_other' => 'nullable|string|max:200',
            'chip_number' => 'nullable|string|max:200',
            'title_before' => 'nullable|string|max:200',
            'name' => 'nullable|string|max:200',
            'title_after' => 'nullable|string|max:200',
            'printname1' => 'nullable|string|max:200',
            'printname2' => 'nullable|string|max:200',
            'deathdate' => 'date',
            'printdate' => 'date',
            'ownershipdate' => 'date',
            'birthdate' => 'date',
            'sex' => 'nullable|in:M,F',
            'color' => 'nullable|string|max:200',
            'breed' => 'nullable|string|max:200',
            'origin' => 'nullable|in:domestic,imported,exported,recorded',
            'father_id' => 'nullable|integer',
            'mother_id' => 'nullable|integer',
            'cattery_id' => 'nullable|integer',
            'breeder_id' => 'nullable|integer',
            'owner_id' => 'nullable|integer',
            'attribute1' => 'nullable|string|max:200',
            'attribute2' => 'nullable|string|max:200',
            'attribute3' => 'nullable|string|max:200',
            'attribute4' => 'nullable|string|max:200',
            'note' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }
        $cat = Cat::findOrFail($id);
        $updatedFields = $request->only([
            'identifier',
            'registration_number_new',
            'registration_number_original',
            'registration_number_other',
            'chip_number',
            'title_before',
            'name',
            'title_after',
            'printname1',
            'printname2',
            'deathdate',
            'printdate',
            'ownershipdate',
            'birthdate',
            'sex',
            'color',
            'breed',
            'origin',
            'father_id',
            'mother_id',
            'cattery_id',
            'breeder_id',
            'owner_id',
            'attribute1',
            'attribute2',
            'attribute3',
            'attribute4',
            'note'
        ]);
        if (!empty($updatedFields)) {
            $cat->update($updatedFields);
        }

        $response = [
            'message' => 'Success',
            'cat' => $cat->load('catDocuments', 'cattery', 'breeder', 'owner')
        ];
        return response($response);
    }

    public function show($id)
    {
        $cat = Cat::findOrFail($id)->load('cattery', 'breeder', 'owner','catDocuments');
        $cat->load('mother', 'father');

        $cat = $this->loadParentsRecursively($cat);

        return $cat;
    }

    private function loadParentsRecursively($cat)
    {
        if ($cat->mother) {
            $cat->mother->load('mother', 'father');
            $cat->mother = $this->loadParentsRecursively($cat->mother);
        }

        if ($cat->father) {
            $cat->father->load('mother', 'father');
            $cat->father = $this->loadParentsRecursively($cat->father);
        }

        return $cat;
    }
    public function showByIdentifier($identifier){
        return Cat::where('identifier', 'LIKE', "%{$identifier}%")->get();
    }


//    public function destroy($id){
//        $cat = Cat::find($id);
//        $cat->delete();
//    }

    public function showBreedNumber($breed){
        $maxValue = Cat::where('breed', $breed)->max('pk_breed_number');
        return $maxValue + 1;
    }

    public function fileUpload(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:certification,pedigree,medical,other,genetic'
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }
        $file = $request->file('file');

        // Check if a file was uploaded
        if (!$file) {
            return response(['File was not found in request'], 422);
        }

        $catDirectory = storage_path('app/public/cat_documents/' . $id);

        if (!file_exists($catDirectory)) {
            mkdir($catDirectory, 0777, true);
        }

        $fileName = $file->getClientOriginalName();
        $filePath = $catDirectory . '/' . $fileName;

        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $file->move($catDirectory, $fileName);

        $catDocument = CatDocument::create([
            'type' => $request['type'],
            'cat_id' => $id,
            'name' => $fileName,
            'path' => $filePath
        ]);

        return response($catDocument);
    }
    public function downloadFile($id)
    {
        $fileRecord = CatDocument::find($id);
        $path = storage_path('app/public/cat_documents/'.$fileRecord['cat_id'].'/'.$fileRecord['name']);

        if (!File::exists($path)) {
            abort(404);
        }

        $response = new BinaryFileResponse($path);
        $response->headers->set('Content-Type', $fileRecord['mime_type']);

        return $response;
    }

    public function destroyFile($id)
    {
        $fileRecord = CatDocument::find($id);
        $path = storage_path('app/public/cat_documents/'.$fileRecord['cat_id'].'/'.$fileRecord['name']);

        if (!File::exists($path)) {
            abort(404);
        }

        // Rename the file to indicate that it has been deleted
        $deletedFileName = 'DELETED_' . $fileRecord['name'];
        Storage::move('public/cat_documents/'.$fileRecord['cat_id'].'/'.$fileRecord['name'], 'public/cat_documents/'.$fileRecord['cat_id'].'/'.$deletedFileName);

        // Update the file record in the database to reflect the renamed file
        $fileRecord->name = $deletedFileName;
        $fileRecord->save();
        $fileRecord->delete();

        return response(['message' => 'Success']);
    }
}
