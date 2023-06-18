// Lubomir Majchrak

const WebSocket = require('ws')
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const app = express();
const serverPort = 8080;
const wSocket = new WebSocket.Server({port: 8082});
const Game = require('./server-side.js');
let games = [];
let tokens = [];
let loggedUsers = new Map();

wSocket.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wSocket.on('connection', ws => {
    ws.id = wSocket.getUniqueID();
    let token = generateToken();
    tokens.push(token);
    ws.send(JSON.stringify({'type': 'setToken', 'token': token}))
    let game = new Game(ws.id,token);
    games.push(game);
    ws.send(JSON.stringify({'type': 'setID', 'id': ws.id}))

    game.data.ival = setInterval(function() {
        gameLoop(game);
    }, game.data.speed);

    ws.on('close', function (){
        var g = getGame(ws.id);
        if(g){
            clearInterval(g.data.ival);
            for (const gKey in games) {
                if(games[gKey].data.id === ws.id){
                    games.splice(gKey, 1);
                    break
                }
            }
        }
    })

    ws.on('message', function (msg){
        var data = JSON.parse(msg);
        if(data.type === 'reset'){
            var game = getGameToken(token);
            if(game.data.score > game.data.maxScore){
                updateUser(game);
            }
            clearInterval(game.data.ival);
            game.data.prevTx = -1;
            game.data.prevTy = -1;
            game.data.line = [];
            game.generateLine();
            game.data.playerTx = 1;
            game.data.playerTy = Math.floor(game.data.gameHeight/2);
            game.data.iter = 0;
            game.data.speed = 75;
            game.data.score = 0;
            game.data.ival = setInterval(function() {
                gameLoop(game);
            }, game.data.speed);
        }
        if(data.type === 'stop'){
            var game = getGameToken(token);
            clearInterval(game.data.ival);
        }
        if(data.type === 'logout'){
            loggedUsers.delete(data.token);
            rmGame(data.id);
            let game = new Game(ws.id,token);
            games.push(game);
            ws.send(JSON.stringify({'type': 'setID', 'id': ws.id}))
            game.data.ival = setInterval(function() {
                gameLoop(game);
            }, game.data.speed);
        }
    })

    function gameLoop(game){
        ws.send(JSON.stringify({'type': 'undrawLine','score': game.data.score, 'speed': game.data.speed, 'maxScore':game.data.maxScore, 'maxSpeed': game.data.maxSpeed}));
        if((game.data.iter % game.data.gameWidth) === 0 && game.data.iter !== 0) game.bumpLine();
        game.moveLine();
        const toSend = [].concat(game.drawLine(game.data.line), game.drawPlayer(game.data.playerTx,game.data.playerTy));
        ws.send(JSON.stringify({'type': 'drawWithStyle', 'points': toSend}))
        if((game.data.iter % (game.data.gameWidth * 3)) === 0 && game.data.iter !== 0) {
            if(game.data.speed > 5) {
                game.data.speed = Math.floor(game.data.speed * 0.8);
                console.log('faster: '+game.data.speed);
                clearInterval(game.data.ival);
                game.data.ival = setInterval(function() {
                    gameLoop(game);
                }, game.data.speed);
            }
        }

        if(game.collision()) {
            console.log('collision');
            clearInterval(game.data.ival);
            if(game.data.score > game.data.maxScore){
                updateUser(game);
                game.data.maxScore = game.data.score;
                game.data.maxSpeed = game.data.speed;
            }

        }
        game.data.iter++;
        game.data.score += game.data.speed;
    }

});

function updateUser(game){
    if (loggedUsers.has(game.data.token)) {
        let login = loggedUsers.get(game.data.token);
        fs.readFile('acc.json', 'utf8', function readFileCallback(err, users){
            if (err){
                console.log(err);
            } else {
                var user = JSON.parse(users);
                for (const i in user.user) {
                    if (user.user[i].login === login) {
                        user.user[i].maxSpeed = game.data.speed;
                        user.user[i].maxScore = game.data.score;
                        fs.writeFile('acc.json', JSON.stringify(user), function(err) {
                            if (err) throw err;
                            console.log('complete');
                        });
                        break;
                    }
                }
            }
        });
    }
}

function generateToken(){
    let poss = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let token = '';
    for (let i = 0; i < 10; i++) {
        token += poss.charAt(Math.floor(Math.random() * poss.length));
    }
    return token;
}

function registerUser(data) {
    var validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    var validLogin = /^[a-zA-Z]*$/;
    if (!validEmail.test(data.email)) {
        return {'type': 'fail', 'message': 'bad email format'};
    }
    if (!validLogin.test(data.login)) {
        return {'type': 'fail', 'message': 'bad login format'};
    }
    delete require.cache[require.resolve('./acc.json')];
    const acc = require('./acc.json');
    if (data.password === data.password2) {
        for (const i in acc.user) {
            if (acc.user[i].login === data.login) {
                return {'type': 'fail', 'message': 'login already taken'};
            }
        }
        for (const i in acc.user) {
            if (acc.user[i].email === data.email) {
                return {'type': 'fail', 'message': 'email already taken'};
            }
        }
        let user = {user: []};
        fs.readFile('acc.json', 'utf8', function readFileCallback(err, users) {
            if (err) {
                console.log(err);
            } else {
                user = JSON.parse(users);
                user.user.push({
                    login: data.login,
                    email: data.email,
                    password: bcrypt.hashSync(data.password, 10),
                    maxSpeed: 75,
                    maxScore: 0,
                    carColor: 'red',
                });
                fs.writeFile('acc.json', JSON.stringify(user), function (err) {
                    if (err) throw err;
                    console.log('complete');
                });
            }
        });
        return {'type': 'success', 'message': 'registration is ok'};
    }
    return {'type': 'fail', 'message': 'passwords doesnt match'};
}

function updateScore(msg){
    var game = getGameToken(msg.token);
    if (loggedUsers.has(game.data.token)) {
        let login = loggedUsers.get(game.data.token);
        fs.readFile('acc.json', 'utf8', function readFileCallback(err, users){
            if (err){
                console.log(err);
            } else {
                var user = JSON.parse(users);
                for (const i in user.user) {
                    if (user.user[i].login === login) {
                        game.data.maxSpeed = user.user[i].maxSpeed;
                        game.data.maxScore = user.user[i].maxScore;
                        break;
                    }
                }
            }
        });
    }
}

function loginUser(data){
    delete require.cache[require.resolve('./acc.json')];
    const acc = require('./acc.json');
    for (const i in acc.user){
        if (acc.user[i].login === data.login) {
            if (bcrypt.compareSync(data.password, acc.user[i].password)) {
                loggedUsers.set(data.token, data.login);
                updateScore(data);
                return {'type': 'success', 'message':'succesfully loged in', 'user': data.login, 'carColor': acc.user[i].carColor};
            }
        }
    }
    return {'type': 'fail', 'message':'bad name or password'};
}

function getGame(id){
    for (const i in games) {
        if(games[i].data.id === id){
            return games[i];
        }
    }
}

function getGameToken(token){
    for (const i in games) {
        if(games[i].data.token === token){
            return games[i];
        }
    }
}

function rmGame(id){
    var g = getGame(id);
    clearInterval(g.data.ival);
    for (const gKey in games) {
        if(games[gKey].data.id === id){
            games.splice(gKey, 1);
            break
        }
    }
}

app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());

app.get('/', function (req, res){
    res.sendFile(path.resolve('./public/index.html'));
});

app.post('/login', function (req, res){
    res.send(loginUser(req.body));

});

app.post('/register', function (req, res){
    res.send(registerUser(req.body));
});

app.post('/move', function (req, res){
    var game = getGame(req.body.id);
    game.movePlayer(req.body.direction);
    res.send({'message': 'moving done'})
});

app.post('/players', function (req, res){
    var user;
    fs.readFile('acc.json', 'utf8', function readFileCallback(err, users) {
        if (err) {
            console.log(err);
        } else {
            user = users;
            res.send({'message': 'players', 'players': user})
        }
    });
});

app.post('/getGames', function (req, res){
    rmGame(req.body.id);
    var gamesID = [];
    for (const gamesIDKey in games) {
        gamesID.push(games[gamesIDKey].data.id)
    }
    console.log(gamesID);
    res.send({'message': 'sendingGames', 'games': gamesID});
});

app.post('/deletePlayer', function (req, res){
    var user;
    fs.readFile('acc.json', 'utf8', function readFileCallback(err, users) {
        if (err) {
            console.log(err);
        } else {
            user = JSON.parse(users);
            for (const i in user.user) {
                if(req.body.login === 'admin'){
                    res.send({'type': 'fail', 'message': 'admin cannot be deleted'});
                    break;
                }
                else if(user.user[i].login === req.body.login){
                    user.user.splice(i,1);
                    res.send({'type': 'success','message': 'deleted'});
                    break;
                }
            }
            fs.writeFile('acc.json', JSON.stringify(user), function(err) {
                if (err) throw err;
                console.log('complete');
            });
        }
    });
});

app.post('/import', function (req, res){
    fs.readFile('acc.json', 'utf8', function readFileCallback(err, users) {
        if (err) {
            console.log(err);
        } else {
            fs.writeFile('acc.json', JSON.stringify(req.body.users), function(err) {
                if (err) throw err;
                console.log('complete');
                res.send({'type': 'success','message': 'imported'});
            });
        }
    });
});

app.post('/colorChange', function (req, res){
    var game = getGameToken(req.body.token);
    if (loggedUsers.has(game.data.token)){
        let login = loggedUsers.get(game.data.token);
        fs.readFile('acc.json', 'utf8', function readFileCallback(err, users){
            if (err){
                console.log(err);
            } else {
                var user = JSON.parse(users);
                for (const i in user.user) {
                    if (user.user[i].login === login) {
                        user.user[i].carColor = req.body.color;
                        fs.writeFile('acc.json', JSON.stringify(user), function(err) {
                            if (err) throw err;
                            console.log('complete');
                            res.send({'type': 'success','message': 'color changed'});
                        });
                        break;
                    }
                }
            }
        });
    }
});

app.listen(serverPort, () => {
    var fs = require('fs');
    console.log(`Server at http://localhost:${serverPort}`);
    var acc = "./acc.json";
    fs.access(acc, function (err){
        if(err){
            var dict = {
                "user":
                    [
                        {
                            "login":"admin",
                            "email":"admin@admin.admin",
                            "password":"$2b$10$YsNSDIPY5ca2VxxVKNoHlutLn4hzXmAX1muIeJ9hxtAiILvF3ZEz6",
                            "maxSpeed":75,
                            "maxScore":24975,
                            "carColor":"red"
                        },
                        {
                            "login":"lubomir",
                            "email":"lubomir@gmail.com",
                            "password":"$2b$10$fCCHnAra5GTP0CoRLHhgOujKcGRAIDefzrkRDaCUpdfu2HdA5pceu",
                            "maxSpeed":75,
                            "maxScore":0,
                            "carColor":"red"
                        },
                        {
                            "login":"guest",
                            "email":"guest@guest.com",
                            "password":"$2b$10$hGQ4pPK0.IVRFh0C39QYBeh5lQlJgpqYZaQn31aA4mQEOzgCpHbqu",
                            "maxSpeed":75,
                            "maxScore":11925,
                            "carColor":"red"
                        }
                    ]
            };
            var dictstring = JSON.stringify(dict);
            fs.writeFile("acc.json", dictstring, (err) => {
                if (err)
                    console.log(err);
            });
        }
    });
});
