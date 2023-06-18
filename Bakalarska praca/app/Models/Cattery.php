<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $id
 * @property string $name
 * @property string $established
 * @property CatteryBreed[] $catteryBreeds
 * @property Cat[] $cats
 * @property Litter[] $litters
 * @property Person[] $persons
 */
class Cattery extends Model
{
    use SoftDeletes;
    /**
     * @var array
     */
    protected $fillable = ['name', 'established', 'is_local'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function catteryBreeds()
    {
        return $this->hasMany('App\Models\CatteryBreed');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cats()
    {
        return $this->hasMany('App\Models\Cattt');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function litters()
    {
        return $this->hasMany('App\Models\Litter');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function persons()
    {
        return $this->hasMany('App\Models\Person');
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($cattery) {
            $cattery->cats()->update(['cattery_id' => null]);
            $cattery->persons()->update(['cattery_id' => null]);
            $cattery->litters()->update(['cattery_id' => null]);
        });
    }
}
