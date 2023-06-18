<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $cattery_id
 * @property string $breed
 * @property Cattery $cattery
 */
class CatteryBreed extends Model
{
    use SoftDeletes;
    /**
     * @var array
     */
    protected $fillable = ['cattery_id', 'breed'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cattery()
    {
        return $this->belongsTo('App\Models\Cattery');
    }
}
