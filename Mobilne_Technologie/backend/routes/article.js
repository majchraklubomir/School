const express = require("express");
const router = express.Router();
const db = require('../db');

function checkRequiredArticleData(req,res){
    if(req.body['nazov'] === ''|| req.body['nazov'] === undefined){
        res.status(400).send("name is required");
        return false;
    }
    if(req.body['obsah'] === ''|| req.body['obsah'] === undefined){
        res.status(400).send("content is required");
        return false;
    }
    if(req.body['kategoria'] === ''|| req.body['kategoria'] === undefined){
        res.status(400).send("category is required");
        return false;
    }
    return true
}

function notContainsComment(obj, list) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].komentar_id === obj.komentar_id){
            return false;
        }
    }
    return true;
}

/**
 * Get article data, respond to fronted with json
 */
router.get('/:id',async(req,res) =>{
    let images_path = [];
    let comments= [];
    try {
        const bool_id = await db.query("select exists(select 1 from clanky where id = ($1))", [req.params.id]);
        if (bool_id.rows[0]['exists'] === true){
            const article_data = await db.query("select clanky.nazov, clanky.obsah,clanky.kategoria,clanky.klucove_slova, co.cesta_k_obrazku,k.id as komentar_id, k.obsah as komentar_obsah , k.datum_vytvorenia as komentar_datum from clanky left join komentare k on clanky.id = k.clanok_id left join clanok_obrazky co on clanky.id = co.clanok_id where clanky.id = ($1)",[req.params.id]);
            for(let i=0;i<article_data.rows.length;i++){
                let pathImage = article_data.rows[i]['cesta_k_obrazku'];
                let Comment = {
                    komentar_id: article_data.rows[i]['komentar_id'],
                    komentar_obsah: article_data.rows[i]['komentar_obsah'],
                    komentar_datum: article_data.rows[i]['komentar_datum']
                }

                if(notContainsComment(Comment,comments)){
                    comments.push(Comment)}

                let isInImages = images_path.includes(pathImage);
                if(isInImages !== true){images_path.push(pathImage);}
            }

            let final_json = {
                "nazov":article_data.rows[0]['nazov'],
                "obsah":article_data.rows[0]['obsah'],
                "kategoria":article_data.rows[0]['kategoria'],
                "klucove_slova":article_data.rows[0]['klucove_slova'],
                "obrazky": images_path,
                "komentare": comments
            }
            res.json(final_json);
        }else{res.status(400).send("id is not correct")}
    }catch(err){
        res.status(400).send("error occurred")
    }
});

/**
 * Add new article into the database
 */
router.post('/new',async(req,res)=>{
    const bool = checkRequiredArticleData(req,res);
    if(bool) {
        try {
            await db.query("insert into clanky(autor_id,nazov,obsah,kategoria,klucove_slova,datum_vytvorenia) values ($1,$2,$3,$4,$5,$6)", [req.body['autor_id'], req.body['nazov'], req.body['obsah'], req.body['kategoria'], req.body['klucove_slova'], req._startTime]);
            res.status(200).send("ok");
        } catch(err) {
            res.status(400).send("error occurred");
        }
    }
});

/**
 * Save updated article
 */
router.put('/saveUpdatedArticle/:id',async(req,res)=>{
    const bool = checkRequiredArticleData(req,res);
    if(bool) {
        try {
            await db.query("update clanky set nazov = ($1),obsah = ($2),kategoria = ($3),klucove_slova = ($4) where id = ($5)",[req.body['nazov'], req.body['obsah'], req.body['kategoria'], req.body['klucove_slova'],req.params.id])
            res.status(200).send("ok");
        } catch(err) {
            res.status(400).send("error occurred");
        }
    }
});

/**
 * Delete article from database
 */
router.delete('/:id',async(req,res)=>{
    try {
        await db.query("delete from clanky where id = ($1)",[req.params.id]);
        res.status(200).send('ok');
    }catch (err){res.status(400).send("error occurred");}
});

router.get('/',async(req,res) => {
    let dict = [];
    let clanky = [];
    try {
        const all_article = await db.query("select clanky.id, clanky.nazov, clanky.kategoria, pouzivatel.meno from clanky,pouzivatel where clanky.autor_id = pouzivatel.id order by clanky.id DESC\n")
        for(let i=0;i<all_article.rows.length;i++){
            dict.push(all_article.rows[i])
        }
        clanky = {"clanky": dict}
        res.json(clanky);
    }catch(err) {
        res.status(400).send("error occurred");
    }
})

router.get('/user/:id',async(req,res) =>{
    let dict = [];
    let clanky = [];
    try {
        const all_article = await db.query("select clanky.id, clanky.nazov, clanky.obsah, clanky.kategoria from clanky where clanky.autor_id = ($1) order by clanky.id DESC\n", [req.params.id])
        for(let i=0;i<all_article.rows.length;i++){
            dict.push(all_article.rows[i])
        }
        clanky = {"clanky": dict}
        res.json(clanky);
    }catch(err) {
        res.status(400).send("error occurred");
    }
});

module.exports = router;
