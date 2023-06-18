<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property integer $id
 * @property string $accounting_code
 * @property string $name
 * @property string $company_id_number
 * @property string $street
 * @property string $postal
 * @property string $city
 * @property string $registration_number
 * @property string $manager
 * @property string $email
 * @property string $phone
 * @property string $registration_link
 * @property Person[] $persons
 */
class Association extends Model
{
    use SoftDeletes;
    /**
     * @var array
     */
    protected $fillable = ['accounting_code', 'name', 'company_id_number', 'street', 'postal', 'city', 'registration_number', 'manager', 'email', 'phone', 'registration_link'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function persons()
    {
        return $this->hasMany('App\Models\Person');
    }
}
