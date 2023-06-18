<?php

namespace App\Http\Controllers;

use App\Models\Association;

class AssociationController extends Controller
{
    public function index(){
        return Association::all();
    }
}
