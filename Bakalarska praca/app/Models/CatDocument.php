<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $cat_id
 * @property string $type
 * @property string $name
 * @property Cat $cat
 */
class CatDocument extends Model
{
    use SoftDeletes;
    /**
     * @var array
     */
    protected $fillable = ['cat_id', 'type', 'name'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cat()
    {
        return $this->belongsTo('App\Models\Cat', 'cat_id');
    }
}
