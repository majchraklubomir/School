<?php

namespace database\migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('associations', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('breeds_non_standart', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('catteries', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('cattery_breeds', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('cattts', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('cat_documents', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('ems_codes_non_standart', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('litters', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('litter_cats', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('persons', function (Blueprint $table) {
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
