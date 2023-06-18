<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $ems
 * @property string $english
 * @property string $german
 * @property string $french
 * @property string $slovak
 * @property string $czech
 */
class Breed extends Model
{
    /**
     * @var array
     */
    protected $fillable = ['ems', 'english', 'german', 'french', 'slovak', 'czech'];
}
