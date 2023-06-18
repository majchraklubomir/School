const express = require("express");
const router = express.Router();
const db = require('../db');


/**
 *Check connection to database
 */
router.get('/checkConnection',async(req,res) => {
    try {
        const check = await db.query("select VERSION()");
        res.status(200).send('ok');
    }
    catch (err){res.status(400).send("error occurred")}

});

module.exports = router;
