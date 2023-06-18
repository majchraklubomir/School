const express = require('express');
const path = require("path");
const app = express();
const port = 8080;
const mysql = require('mysql2');
const axios = require("axios");

const con = mysql.createConnection({
    host: "mydb",
    user: "root",
    password: "root",
    database: "vavjs",
    dateStrings: ['DATE','DATETIME']
});
app.use(express.static('build'));
app.use(express.urlencoded());
app.use(express.json());


app.get('/', (req, res) => {
    res.sendFile(path.resolve('./build/index.html'));
});

app.post('/register', (req, res) => {
    var validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (req.body.name === '' || req.body.email === '' || req.body.password === '' || req.body.age === '' || req.body.height === '') {
        res.status(400).send('some of required fields was not set');
    } else if(!validEmail.test(req.body.email)){
        res.status(400).send('wrong email form');
    }else {
        const check = "SELECT email FROM pouzivatelia WHERE email = '" + req.body.email + "'";
        con.connect(function (err) {
            con.query(check,function (err, result,fields){
                if(result.length > 0){
                    res.status(409).send("conflict with already existing email address");
                }
                else{
                    const sql = "INSERT INTO pouzivatelia (meno, email, vek, vyska, heslo) VALUES ('" + req.body.name + "', '" + req.body.email + "', '" + req.body.age + "', '" + req.body.height + "', '" + req.body.password + "')";
                    con.query(sql,function (err, result,fields){
                        res.status(200).send("ok");
                    });
                }
            });
        });
    }
});

app.post('/login', (req, res) => {
    if (req.body.email === '' || req.body.password === '') {
        res.status(400).send('email or password not set');
    } else {
        const sql = "SELECT * FROM pouzivatelia WHERE email='" + req.body.email + "'";
        con.connect(function (err) {
            con.query(sql,function (err, result,fields){
                if(result.length > 0){
                    if (req.body.password === result[0]['heslo']) {
                        res.status(200).send({id: result[0]['id'], name: result[0]['meno']});
                    } else
                        res.status(400).send("incorrect password");
                }

            });
        });
    }
});

app.post('/deleteUser', (req,res)=>{
    if(req.body.email === 'admin@admin.admin'){
        res.status(400).send('Sorry admin user cannot be deleted')
    }
    const sql = "DELETE FROM pouzivatelia WHERE email='" + req.body.email + "'";
    con.connect(function (err) {
        con.query(sql,function (err, result,fields) {
            res.status(200).send('ok');
        });
    });
});


app.get('/getUsers',(req,res) =>{
    const sql = "SELECT meno, heslo, email, vek, vyska FROM pouzivatelia";
    con.connect(function (err) {
        con.query(sql,function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.get('/getCounter',(req,res) =>{
    const sql = "SELECT pocitadlo FROM reklama";
    con.connect(function (err) {
        con.query(sql,function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.post('/import',(req,res) =>{
    var validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    con.connect(function (err) {
        const sql = "SELECT email FROM pouzivatelia";
        con.query(sql,function (err, result, fields) {
            let ele = result.map(({email}) => email);
            for (const u in req.body.user) {
                if (typeof req.body.user[u].name === 'undefined') continue;
                else if (typeof req.body.user[u].email === 'undefined') continue;
                else if (typeof req.body.user[u].age === 'undefined') continue;
                else if (typeof req.body.user[u].height === 'undefined') continue;
                else if (typeof req.body.user[u].password === 'undefined') continue;
                let name = req.body.user[u].name.replace(/["']/g, "");
                let email = req.body.user[u].email.replace(/["']/g, "");
                let age = req.body.user[u].age.replace(/["']/g, "");
                let height = req.body.user[u].height.replace(/["']/g, "");
                let password = req.body.user[u].password.replace(/["']/g, "");
                if (!ele.includes(email)) {
                    if (validEmail.test(email)) {
                        const sql1 = "INSERT INTO pouzivatelia (meno, email, vek, vyska, heslo) VALUES ('" + name + "', '" + email + "', '" + age + "', '" + height + "', '" + password + "')";
                        con.query(sql1);
                    }
                }
            }
            res.status(200).send('ok');
        });
    });
});

app.post('/importMeasurements',(req,res) =>{
    con.connect(function (err) {
        const sql = "SELECT id FROM pouzivatelia";
        con.query(sql,function (err, result, fields) {
            let ele = result.map(({id}) => id.toString());
            for (const u in req.body.user) {
                if (typeof req.body.user[u].userid === 'undefined') continue;
                else if (typeof req.body.user[u].value === 'undefined') continue;
                else if (typeof req.body.user[u].method === 'undefined') continue;
                else if (typeof req.body.user[u].date === 'undefined') continue;
                let userid = req.body.user[u].userid.replace(/["']/g, "");
                let value = req.body.user[u].value.replace(/["']/g, "");
                let method = req.body.user[u].method.replace(/["']/g, "");
                let date = req.body.user[u].date.replace(/["']/g, "");
                if (ele.includes(userid)) {
                    const sql1 = "INSERT INTO vahy (hodnota, metoda, datum, userid) VALUES ('" + value + "', '" + method + "', '" + date + "', '" + userid + "')";
                    con.query(sql1);
                }
            }
            res.status(200).send('ok');
        });
    });
});

app.post('/importMethods',(req,res) =>{
    con.connect(function (err) {
        const sql = "SELECT id FROM pouzivatelia";
        con.query(sql,function (err, result, fields) {
            let ele = result.map(({id}) => id.toString());
            for (const u in req.body.user) {
                if (typeof req.body.user[u].userid === 'undefined') continue;
                else if (typeof req.body.user[u].name === 'undefined') continue;
                else if (typeof req.body.user[u].description === 'undefined') continue;
                let userid = req.body.user[u].userid.replace(/["']/g, "");
                let name = req.body.user[u].name.replace(/["']/g, "");
                let description = req.body.user[u].description.replace(/["']/g, "");
                const sql2 = "SELECT nazov FROM metody WHERE userid=?";
                con.query(sql2,[userid],function (err, result, fields) {
                    let ele1 = result.map(({nazov}) => nazov);
                    if (ele.includes(userid)) {
                        if (!ele1.includes(name)) {
                            const sql1 = "INSERT INTO metody (nazov, popis, userid) VALUES ('" + name + "', '" + description + "', '" + userid + "')";
                            con.query(sql1);
                        }
                    }
                })
            }

            res.status(200).send('ok');
        });
    });
});

app.post('/setAd',(req,res)=>{
    const sql = "UPDATE reklama SET link_ciel=?, link_obrazok=? WHERE id=1";
    con.connect(function (err) {
        con.query(sql,[req.body.redir,req.body.ad],function (err, result,fields) {
            res.status(200).send('ok');
        });
    });
});

app.post('/getMeasurements',(req,res) =>{
    const sql = "SELECT * FROM vahy WHERE userid='"+ req.body.userid +"'";
    con.connect(function (err) {
        con.query(sql,function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.post('/getMethods',(req,res) =>{
    const sql = "SELECT * FROM metody WHERE userid='"+ req.body.userid +"'";
    con.connect(function (err) {
        con.query(sql,function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.post('/deleteMethod',(req,res) =>{
    const sql = "DELETE FROM metody WHERE id='" + req.body.id + "'";
    con.connect(function (err) {
        con.query(sql,function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.post('/addMethod',(req,res)=>{
    con.connect(function (err) {
        const sql = "INSERT INTO metody (nazov, popis, userid) VALUES ('" + req.body.name + "', '" + req.body.description + "', '" + req.body.userid + "')";
        con.query(sql,function (err, result,fields){
            res.status(200).send("ok");
        });
    });
});

app.post('/addMeasurement',(req,res)=>{
    con.connect(function (err) {
        const sql = "INSERT INTO vahy (hodnota, metoda, datum, userid) VALUES ('" + req.body.value + "', '" + req.body.method + "', '" + req.body.date + "', '" + req.body.userid + "')";
        con.query(sql,function (err, result,fields){
            res.status(200).send("ok");
        });
    });
});

app.post('/deleteMeasurement',(req,res) =>{
    const sql = "DELETE FROM vahy WHERE id='" + req.body.id + "'";
    con.connect(function (err) {
        con.query(sql,function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.post('/filter',(req,res) =>{
    const sql = "SELECT id, hodnota, metoda, datum, userid FROM vahy WHERE (metoda=? AND userid=?)";
    con.connect(function (err) {
        con.query(sql,[req.body.filter,req.body.userid],function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.post('/getDataRange',(req,res) =>{
    const sql = "SELECT * FROM vahy WHERE (userid=? AND datum BETWEEN ? AND ?)";
    con.connect(function (err) {
        con.query(sql,[req.body.userid,req.body.timeStart,req.body.timeEnd],function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.post('/getData',(req,res) =>{
    const sql = "SELECT * FROM vahy WHERE userid=?";
    con.connect(function (err) {
        con.query(sql,[req.body.userid],function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.get('/getAd',(req,res) =>{
    const sql = "SELECT * FROM reklama";
    con.connect(function (err) {
        con.query(sql,function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

app.post('/updateCounter',(req,res)=>{
    const sql = "UPDATE reklama SET pocitadlo=? WHERE id=1";
    con.connect(function (err) {
        con.query(sql,[req.body.counter],function (err, result,fields) {
            res.status(200).send('ok');
        });
    });
});

app.post('/userID',(req,res) =>{
    const sql = "SELECT id FROM pouzivatelia WHERE email=?";
    con.connect(function (err) {
        con.query(sql,[req.body.email],function (err, result,fields){
            res.status(200).send(result);
        });
    });
});

function createDB(){
    con.connect(function (err) {
        let sql = "CREATE SCHEMA IF NOT EXISTS `vavjs` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci";
        con.query(sql);
        sql = "USE vavjs";
        con.query(sql);
        sql = "CREATE TABLE IF NOT EXISTS `pouzivatelia` (\n" +
            "  `id` INT NOT NULL AUTO_INCREMENT,\n" +
            "  `email` VARCHAR(45) NULL DEFAULT NULL,\n" +
            "  `meno` VARCHAR(45) NULL DEFAULT NULL,\n" +
            "  `heslo` VARCHAR(45) NULL DEFAULT NULL,\n" +
            "  `vek` VARCHAR(5) NULL DEFAULT NULL,\n" +
            "  `vyska` VARCHAR(5) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`),\n" +
            "  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)"
        con.query(sql);
        sql = "CREATE TABLE IF NOT EXISTS `metody` (\n" +
            "  `id` INT NOT NULL AUTO_INCREMENT,\n" +
            "  `nazov` VARCHAR(150) NULL DEFAULT NULL,\n" +
            "  `popis` VARCHAR(150) NULL DEFAULT NULL,\n" +
            "  `userid` INT NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`),\n" +
            "  INDEX `userid_idx` (`userid` ASC) VISIBLE,\n" +
            "  CONSTRAINT `userid`\n" +
            "    FOREIGN KEY (`userid`)\n" +
            "    REFERENCES `pouzivatelia` (`id`)\n" +
            "    ON DELETE CASCADE)"
        con.query(sql);
        sql = "CREATE TABLE IF NOT EXISTS `reklama` (\n" +
            "  `id` INT NOT NULL AUTO_INCREMENT,\n" +
            "  `link_ciel` VARCHAR(150) NULL DEFAULT NULL,\n" +
            "  `link_obrazok` VARCHAR(150) NULL DEFAULT NULL,\n" +
            "  `pocitadlo` INT NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`))"
        con.query(sql);
        sql = "CREATE TABLE IF NOT EXISTS `vahy` (\n" +
            "  `id` INT NOT NULL AUTO_INCREMENT,\n" +
            "  `hodnota` INT NULL DEFAULT NULL,\n" +
            "  `metoda` VARCHAR(45) NULL DEFAULT NULL,\n" +
            "  `datum` DATE NULL DEFAULT NULL,\n" +
            "  `userid` INT NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`),\n" +
            "  INDEX `userid_idx` (`userid` ASC) VISIBLE,\n" +
            "  CONSTRAINT `usid`\n" +
            "    FOREIGN KEY (`userid`)\n" +
            "    REFERENCES `pouzivatelia` (`id`)\n" +
            "    ON DELETE CASCADE)"
        con.query(sql);
        sql = "SELECT * FROM pouzivatelia WHERE email='admin@admin.admin'";
        con.query(sql,function (err, result,fields){
            if(result.length === 0){
                sql = "INSERT INTO reklama (link_ciel, link_obrazok, pocitadlo) VALUES ('https://www.dracik.sk/','https://drive.google.com/uc?id=1MIJKJ_RB-1BT73ZtZQ0sEt7raUdTPFrJ',0)"
                con.query(sql);
                sql = "INSERT INTO pouzivatelia (meno, email, vek, vyska, heslo) VALUES ('admin','admin@admin.admin',18,155,'admin')"
                con.query(sql);
            }
        });
    })
}

if(!module.parent){ app.listen(port,()=>{createDB()}); }
module.exports = app;