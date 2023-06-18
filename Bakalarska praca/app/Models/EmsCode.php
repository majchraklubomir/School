<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $group
 * @property string $ems
 * @property string $english
 * @property string $german
 * @property string $french
 * @property string $slovak
 * @property string $czech

 */
class EmsCode extends Model
{
    public $timestamps = false;
    /**
     * @var array
     */
    protected $fillable = ['group', 'ems', 'english', 'german', 'french', 'slovak', 'czech'];
}
