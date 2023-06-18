const express = require("express");
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require("path");

function checkRequiredData(req,res){
    if(req.body['clanok_id'] === ''||req.body['clanok_id'] === undefined){
        res.status(400).send("article id is required");
        return false;
    }
    return true;
}

const dstFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

const upload = multer({storage:dstFileStorage});

/**
 * Add new image
 */
router.post('/new', upload.single('obrazok'), async(req,res)=>{
    const bool = checkRequiredData(req,res);
    if(bool){
        try {
            await db.query("insert into clanok_obrazky(clanok_id, cesta_k_obrazku) values ($1,$2)",[req.body['clanok_id'],req.file.path]);
            res.status(200).send('ok');
        }catch (err){res.status(400).send("error occurred")}
    }
});

router.get('/:id',async(req,res) =>{
    try {
        const bool_id = await db.query("select exists(select 1 from clanky where id = ($1))", [req.params.id]);
        if (bool_id.rows[0]['exists'] === true){
            const obrazky = await db.query("select cesta_k_obrazku from clanok_obrazky where clanok_id = ($1)",[req.params.id]);
            const road = path.join(__dirname, '..', Object.values(obrazky.rows[0]).toString());
            res.sendFile(road);
        }else{res.status(400).send("id is not correct")}
    }catch(err){
        res.status(400).send("error occurred")
    }
});

router.delete('/:id',async(req,res)=>{
    try {
        await db.query("delete from clanok_obrazky where id = ($1)",[req.params.id]);
        res.status(200).send('ok');
    }catch (err){res.status(400).send("error occurred");}
});

module.exports = router;
