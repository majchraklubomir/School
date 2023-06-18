<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $person_id
 * @property string $street
 * @property string $city
 * @property string $postal
 * @property string $state
 * @property string $type
 * @property Person $person
 */
class Address extends Model
{
    use SoftDeletes;
    /**
     * @var array
     */
    protected $fillable = ['person_id', 'street', 'city', 'postal', 'state', 'type'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function person()
    {
        return $this->belongsTo('App\Models\Person');
    }
}
