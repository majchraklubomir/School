<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
class EmsCodeNonStandart extends Model
{
    use SoftDeletes;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'ems_codes_non_standart';

    /**
     * @var array
     */
    protected $fillable = ['group', 'ems', 'english', 'german', 'french', 'slovak', 'czech'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
}
