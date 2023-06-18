<?php

use App\Http\Controllers\AssociationController;
use App\Http\Controllers\CatController;
use App\Http\Controllers\LitterController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\CatteryController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BreedController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmsCodeController;

//Public routes

Route::post('/auth/login',[UserController::class, 'login']);

//Protected routes
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::post('/auth/logout', [UserController::class, 'logout']);
    Route::post('/auth/register',[UserController::class, 'register']);


    });
//Breeds
Route::get('/breeds', [BreedController::class, 'index']);
Route::post('/breed', [BreedController::class, 'store']);
Route::get('/breeds/{breed}', [BreedController::class, 'show']);

//Person
Route::post('/person/filter', [PersonController::class, 'filter']);
Route::post('/person', [PersonController::class, 'store']);
Route::put('/person/{id}', [PersonController::class, 'update']);
Route::get('/person/id/{id}', [PersonController::class, 'showId']);

Route::get('/person/{name}', [PersonController::class, 'show']);

Route::delete('/person/{id}', [PersonController::class, 'destroy']);

//Cattery
Route::get('/cattery/name/{name}', [CatteryController::class, 'showName']);
Route::get('/cattery/{id}', [CatteryController::class, 'showId']);
Route::post('/cattery', [CatteryController::class, 'store']);
Route::post('/cattery/filter', [CatteryController::class, 'filter']);
Route::put('/cattery/{id}', [CatteryController::class, 'update']);
Route::delete('/cattery/{id}', [CatteryController::class, 'destroy']);

//EmsCodes
Route::get('/ems/{emsCode}', [EmsCodeController::class, 'validateEms']);
Route::post('/ems', [EmsCodeController::class, 'store']);
Route::post('/ems/upload', [EmsCodeController::class, 'uploadEms']);

//Associations
Route::get('/association', [AssociationController::class, 'index']);

//Cat
Route::post('/cat/filterByIdentifier', [CatController::class, 'filterByIdentifier']);
Route::post('/cat/filter', [CatController::class, 'filter']);
Route::post('/cat', [CatController::class, 'store']);
Route::post('/cat/document/{id}', [CatController::class, 'fileUpload']);
Route::put('/cat/{id}', [CatController::class, 'update']);
Route::get('/cat/identifier/{identifier}', [CatController::class, 'showByIdentifier']);
Route::get('/cat/breedNumber/{breed}', [CatController::class, 'showBreedNumber']);
Route::get('/cat/document/{id}', [CatController::class, 'downloadFile']);
Route::get('/cat/{id}', [CatController::class, 'show']);
//Route::delete('/cat/document/{id}', [CatController::class, 'destroyFile']);


//Litter
Route::post('/litter', [LitterController::class, 'store']);
Route::get('/litter/{id}', [LitterController::class, 'show']);


//Route::delete('/cat/{id}', [CatController::class, 'destroy']);
