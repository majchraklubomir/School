<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $id
 * @property integer $father_id
 * @property integer $mother_id
 * @property integer $cattery_id
 * @property integer $breeder_id
 * @property integer $owner_id
 * @property string $identifier
 * @property string $registration_number
 * @property string $registration_number2
 * @property string $chip_number
 * @property integer $pk_breed_number
 * @property string $title_before
 * @property string $name
 * @property string $title_after
 * @property string $printname1
 * @property string $printname2
 * @property string $birthdate
 * @property string $deathdate
 * @property string $origin
 * @property string $printdate
 * @property string $gender
 * @property string $color
 * @property string $breed
 * @property string $ownershipdate
 * @property string $attribute1
 * @property string $attribute2
 * @property string $attribute3
 * @property string $attribute4
 * @property CatDocument[] $catDocuments
 * @property Person $person
 * @property Cat $cat
 * @property Cattery $cattery
 * @property Litter[] $litters
 */
class Cat extends Model
{
    use SoftDeletes;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cattts';

    /**
     * @var array
     */
    protected $fillable = ['father_id', 'mother_id', 'cattery_id', 'breeder_id', 'owner_id', 'identifier', 'registration_number_new', 'registration_number_other', 'registration_number_original', 'chip_number', 'pk_breed_number', 'title_before', 'name', 'title_after', 'printname1', 'printname2', 'birthdate', 'deathdate', 'origin', 'printdate', 'sex', 'color', 'breed', 'ownershipdate', 'attribute1', 'attribute2', 'attribute3', 'attribute4', 'note'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function catDocuments()
    {
        return $this->hasMany('App\Models\CatDocument', 'cat_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function owner()
    {
        return $this->belongsTo('App\Models\Person', 'owner_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function father()
    {
        return $this->belongsTo('App\Models\Cat', 'father_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function breeder()
    {
        return $this->belongsTo('App\Models\Person', 'breeder_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cattery()
    {
        return $this->belongsTo('App\Models\Cattery');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function mother()
    {
        return $this->belongsTo('App\Models\Cat', 'mother_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function mother_litter()
    {
        return $this->hasMany('App\Models\Litter', 'mother_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function father_litter()
    {
        return $this->hasMany('App\Models\Litter', 'father_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($cat) {
            $cat->father_litter()->update(['father_id' => null]);
            $cat->mother_litter()->update(['mother_id' => null]);
        });
    }
}
