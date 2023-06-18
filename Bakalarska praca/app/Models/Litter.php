<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $id
 * @property integer $father_id
 * @property integer $mother_id
 * @property integer $cattery_id
 * @property string $type
 * @property string $birth_date
 * @property string $coverage_date
 * @property string $license_date
 * @property string $mark
 * @property string $breed
 * @property integer $born_males
 * @property integer $born_females
 * @property integer $kept_males
 * @property integer $kept_females
 * @property string $created_at
 * @property string $updated_at
 * @property string $deleted_at
 * @property LitterCat[] $litterCats
 * @property Cattery $cattery
 * @property Cat $cat
 */
class Litter extends Model
{
    use SoftDeletes;
    /**
     * @var array
     */
    protected $fillable = ['father_id', 'mother_id', 'cattery_id', 'type', 'birth_date', 'coverage_date', 'license_date', 'marking', 'breed', 'born_males', 'born_females', 'kept_males', 'kept_females'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function litterCats()
    {
        return $this->hasMany('App\Models\LitterCat');
    }

    public function litter_cats()
    {
        return $this->hasManyThrough(Cat::class, LitterCat::class, 'cat_id', 'id', 'id', 'litter_id');
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
        return $this->belongsTo('App\Models\Cattt', 'mother_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function father()
    {
        return $this->belongsTo('App\Models\Cattt', 'father_id');
    }
}
