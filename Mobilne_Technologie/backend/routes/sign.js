const express = require("express");
const router = express.Router();
const db = require('../db');

/**
*Check if mail is already in database
 */
router.get('/checkEmail/:email',async(req,res) => {
    try {
        const bool_mail = await db.query("select exists(select 1 from pouzivatel where email = ($1))", [req.params.email]);
        if (bool_mail.rows[0]['exists'] === true) {
            res.status(409).send("conflict with already existing email address");
            return;
        }
        res.status(200).send("ok");
    }
    catch (err){res.status(400).send("error occurred")}

});

router.get('/:email',async(req,res) => {
    try {
        const bool_mail = await db.query("select exists(select 1 from pouzivatel where email = ($1))", [req.params.email]);
        if (bool_mail.rows[0]['exists'] === true) {
            const id = await db.query("select id from pouzivatel where email = ($1)", [req.params.email]);
            res.json(id.rows[0]);
        }else{res.status(400).send("does not exist")}
    } catch (err){res.status(400).send("error occurred")}
})

/**
Register new user
 */
router.post('/newUser',async(req,res) =>{
    if(req.body['meno'] === ''|| req.body['meno'] === undefined){res.status(400).send("name is required");return;}
    if(req.body['heslo'] === ''|| req.body['heslo'] === undefined){res.status(400).send("pass is required");return;}
    if(req.body['email'] === ''|| req.body['email'] === undefined){res.status(400).send("email is required");return;}
    try {
        await db.query("insert into pouzivatel(meno,heslo,email,profilova_fotka,datum_registracie) values ($1,$2,$3,$4,$5)",[req.body['meno'],req.body['heslo'],req.body['email'], "uploads\\profile.png",req._startTime]);
        res.status(201).send("created new user");
    }
    catch (err){res.status(400).send("error occurred");}
});

/**
Approve logging
 */
router.post('/user',async(req,res) =>{
    try {
        const user_info = await db.query("select email,heslo from pouzivatel where email = ($1)",[req.body['email']]);
        if(req.body['heslo'] === user_info.rows[0]['heslo']){
            res.status(200).send("ok");
        }
        else if(req.body['heslo'] === undefined){
            res.status(400).send( "pass is not provided");
        }else{
            res.status(400).send( "pass is not correct");
        }
    }
    catch (err){res.status(400).send("email is not correct");}
})

module.exports = router;
