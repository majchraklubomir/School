<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $id
 * @property integer $cat_id
 * @property integer $litter_id
 * @property string $name
 * @property integer $pk_breed_number
 * @property string $breed
 * @property string $sex
 * @property string $color
 * @property string $chip
 * @property string $type
 * @property string $note
 * @property string $created_at
 * @property string $updated_at
 * @property string $deleted_at
 * @property Cat $cat
 * @property Litter $litter
 */
class LitterCat extends Model
{
    use SoftDeletes;
    /**
     * @var array
     */
    protected $fillable = ['cat_id', 'litter_id', 'name', 'pk_breed_number', 'breed', 'sex', 'color', 'chip_number', 'type', 'note'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cat()
    {
        return $this->belongsTo('App\Models\Cat');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function litter()
    {
        return $this->belongsTo('App\Models\Litter');
    }
}
