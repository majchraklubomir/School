const express = require("express");
const router = express.Router();
const db = require('../db');

function checkRequiredData(req,res){
    if(req.body['obsah'] === ''||req.body['obsah'] === undefined){
        res.status(400).send("content is required");
        return false;
    }
    if(req.body['clanok_id'] === ''||req.body['clanok_id'] === undefined){
        res.status(400).send("article id is required");
        return false;
    }
    if(req.body['autor_id'] === ''||req.body['autor_id'] === undefined){
        res.status(400).send("author id is required");
        return false;
    }
    return true;
}

/**
 * Add new comment
 */
router.post('/new',async(req,res)=>{
    const bool = checkRequiredData(req,res);
    if(bool){
    try {
        await db.query("insert into komentare(obsah,clanok_id,autor_id,datum_vytvorenia) values ($1,$2,$3,$4)",[req.body['obsah'],req.body['clanok_id'],req.body['autor_id'],req._startTime]);
        const komentar_id = await db.query("select komentare.id from komentare where obsah = ($1) and clanok_id = ($2) and autor_id = ($3)",[req.body['obsah'],req.body['clanok_id'],req.body['autor_id']]);
        await db.query("update clanky set komentar_id = array_append(komentar_id,($1)) where clanky.id = ($2)",[komentar_id.rows[0]['id'],req.body['clanok_id']]);
        res.status(200).send('ok');
    }catch (err){
        console.log(err);
        res.status(400).send("error occurred")}
    }
});

/**
 *  Save updated comment
 */
router.put('/update/:id',async(req,res)=>{
    if(req.body['obsah'] === ''||req.body['obsah'] === undefined){
        res.status(400).send("content is required");return;}
    try {
        await db.query("update komentare set obsah = ($1) where id = ($2)",[req.body['obsah'],req.params.id]);
        res.status(200).send('ok');
    }catch (err){res.status(400).send("error occurred")}
});

/**
 * Delete comment
 */
router.delete('/:id',async(req,res)=>{
    try{
        await db.query("delete from komentare where id = ($1)",[req.params.id]);
        await db.query("update clanky set komentar_id = array_remove(komentar_id,($1))",[req.params.id])
        res.status(200).send('ok');
    }catch (err){res.status(400).send("error occurred")}
});

module.exports = router;
