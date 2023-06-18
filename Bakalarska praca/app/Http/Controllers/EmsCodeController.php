<?php

namespace App\Http\Controllers;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use App\Models\EmsCode;
use App\Models\EmsCodeNonStandart;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;


class EmsCodeController extends Controller
{
    public function validateEms($emsCode){
        $code = EmsCode::where('ems',$emsCode)->first();
        if($code !== null){
            return response(['message' => 'standard']);
        }
        $nonStandardCode = EmsCodeNonStandart::where('ems',$emsCode)->first();
        if($nonStandardCode !== null){
            return response(['message' => 'non-standard']);
        }
        return response(['message' => 'missing']);
    }

    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'group' => 'nullable|string|max:10',
            'ems' => 'required|string|max:150',
            'english' => 'required|string|max:150',
            'german' => 'nullable|string|max:150',
            'french' => 'nullable|string|max:150',
            'slovak' => 'nullable|string|max:150',
            'czech' => 'nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }

        $code = EmsCode::where('ems',$request['ems'])->first();
        if($code !== null){
            return response(['message' => 'code is standard']);
        }
        $nonStandardCode = EmsCodeNonStandart::where('ems',$request['ems'])->first();
        if($nonStandardCode !== null){
            return response(['message' => 'code is non-standard']);
        }

        $ems = EmsCodeNonStandart::create([
            'group' => $request['group'],
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

    public function uploadEms(Request $request){
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx',
        ]);
        if ($validator->fails()) {
            return response([$validator->errors()->all()],422);
        }
        Schema::dropIfExists('ems_codes');
        Schema::create('ems_codes', function (Blueprint $table)
        {
            $table->increments('id');
            $table->string('group',150)->nullable();
            $table->string('ems',150)->nullable();
            $table->string('english',150)->nullable();
            $table->string('german',150)->nullable();
            $table->string('french',150)->nullable();
            $table->string('slovak',150)->nullable();
            $table->string('czech',150)->nullable();
        });

        // Get the uploaded file from the request
        $excel_obj = $request->file('file');
        // Load the file into a PhpSpreadsheet object
        $reader = new Xlsx();
        $spreadsheet = $reader->load($excel_obj);
        // Get the data from the spreadsheet
        $worksheet = $spreadsheet->getSheetByName('BreedMatrix');
        $lastRow = $worksheet->getHighestRow();
        $data = [];

        for ($row = 2; $row <= $lastRow; $row++) {
            if ($worksheet->getCellByColumnAndRow(1, $row) == '') break;
            $line = [];
            for ($col = 68; $col <= 72; $col++) {
                $value = $worksheet->getCellByColumnAndRow($col,$row)->getCalculatedValue();
                $line[] = $value;
            }
            if ((($line[1] == $line[2]) || $line[2] == ' ' || strpos($line[1], '*') || strpos($line[1], 'non') || strpos($line[1], '-') || strstr($line[1], 'Category') || strstr($line[1], 'Group'))) {
                continue;
            }
            elseif (strpos($line[1],'/')){
                $new = explode('/',$line[1]);
                $modify = $new[count($new)-1];
                array_pop($new);
                $new[] = substr($modify, 0, 3);
                $last = substr($modify, 3,strlen($modify));
                for ($i=0;$i<count($new);$i++){
                    $var = $last;
                    $var1 = $new[$i];
                    $line[1] = $var1.$var;
                    $data[] = [
                        'group' => $line[0],
                        'ems' => $line[1],
                        'english' => $line[2],
                        'german' => $line[3],
                        'french' => $line[4]
                    ];
                }
            }
            else {
                $data[] = [
                    'group' => $line[0],
                    'ems' => $line[1],
                    'english' => $line[2],
                    'german' => $line[3],
                    'french' => $line[4]
                ];
            }
        }
        $chunks = array_chunk($data, 5000);

        foreach ($chunks as $chunk) {
            DB::table('ems_codes')->insert($chunk);
        }
        Schema::dropIfExists('breeds');
        Schema::create('breeds', function (Blueprint $table)
        {
            $table->increments('id');
            $table->string('ems',150)->nullable();
            $table->string('english',150)->nullable();
            $table->string('german',150)->nullable();
            $table->string('french',150)->nullable();
            $table->string('slovak',150)->nullable();
            $table->string('czech',150)->nullable();
        });

        $worksheet = $spreadsheet->getSheetByName('Definitions');
        $data = [];
        $lastRow = $worksheet->getHighestRow();
        for ($row = 3; $row <= $lastRow; $row++) {
            $ems = $worksheet->getCellByColumnAndRow(1,$row)->getCalculatedValue();
            $english = $worksheet->getCellByColumnAndRow(2,$row)->getCalculatedValue();
            $german = $worksheet->getCellByColumnAndRow(3,$row)->getCalculatedValue();
            $french = $worksheet->getCellByColumnAndRow(4,$row)->getCalculatedValue();

            if ($english == 'Colours') {
                break;
            } elseif ($ems == '') {
                continue;
            } else {
                $data[] = [
                    'ems' => $ems,
                    'english' => $english,
                    'german' => $german,
                    'french' => $french
                ];
            }
        }
        DB::table('breeds')->insert($data);
        $response = [
            'message' => 'Success'
        ];
        return response($response);
    }
}
