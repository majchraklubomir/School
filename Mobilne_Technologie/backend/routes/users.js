const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');

const dstFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: dstFileStorage });

/**
 * Get user data
 */
router.get('/:id', async(req, res)=> {
  try{
    const bool_id = await db.query("select exists(select 1 from pouzivatel where id = ($1))", [req.params.id]);
    if (bool_id.rows[0]['exists'] === true) {
      const user_data = await db.query("select email,meno,heslo,profilova_fotka,datum_registracie from pouzivatel where pouzivatel.id = ($1)", [req.params.id])
      res.json(user_data.rows[0]);
    }else{res.status(400).send("id is not correct")}
  }catch (err){res.status(400).send("error occurred")}
});

router.get('/photo/:id', async(req, res)=> {
  try {
    const bool_id = await db.query("select exists(select 1 from pouzivatel where id = ($1))", [req.params.id]);
    if (bool_id.rows[0]['exists'] === true){
      const profile = await db.query("select profilova_fotka from pouzivatel where id = ($1)",[req.params.id]);
      const road = Object.values(profile.rows[0]).toString();
      const obrazok ={'obrazok': road}
      res.json(obrazok);
    }else{res.status(400).send("id is not correct")}
  }catch(err){
    res.status(400).send("error occurred")
  }
});

router.put('/updatePhoto/:id', upload.single('obrazok'), async(req,res)=>{
  try {
    await db.query("update pouzivatel set profilova_fotka = ($1) where id = ($2)", [req.file.path, req.params.id])
    res.status(200).send("ok");
  } catch(err) {
    res.status(400).send("error occurred");
  }
});

/**
 * Delete user from database
 */
router.delete('/:id',async(req,res)=>{
  try {
    await db.query("delete from pouzivatel where id = ($1)",[req.params.id]);
    res.status(200).send('ok');
  }catch (err){res.status(400).send("error occurred")}
});

module.exports = router;
