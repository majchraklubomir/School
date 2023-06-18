<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $id
 * @property integer $cattery_id
 * @property integer $association_id
 * @property string $titles_before
 * @property string $first_name
 * @property string $last_name
 * @property string $titles_after
 * @property string $email
 * @property string $phone_number
 * @property string $old_database_address
 * @property string $note
 * @property Address[] $addresses
 * @property Cat[] $cats
 * @property Association $association
 * @property Cattery $cattery
 */
class Person extends Model
{
    use SoftDeletes;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'persons';

    /**
     * @var array
     */
    protected $fillable = ['cattery_id', 'association_id', 'titles_before', 'first_name', 'last_name', 'titles_after', 'email', 'phone_number', 'old_database_address', 'note'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function addresses()
    {
        return $this->hasMany('App\Models\Address');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function owner()
    {
        return $this->hasMany('App\Models\Cat', 'owner_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function breeder()
    {
        return $this->hasMany('App\Models\Cat', 'breeder_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function association()
    {
        return $this->belongsTo('App\Models\Association');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cattery()
    {
        return $this->belongsTo('App\Models\Cattery');
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($person) {
            $person->breeder()->update(['breeder_id' => null]);
            $person->owner()->update(['owner_id' => null]);
        });
    }
}
