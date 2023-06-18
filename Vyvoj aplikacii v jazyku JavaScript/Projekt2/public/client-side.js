// Lubomir Majchrak
var id;
var pixelSize = 12;
var canvas = document.createElement('canvas');
canvas.height = 80 * pixelSize;
canvas.width = 160 * pixelSize;
ctx = canvas.getContext('2d');

var carColor = 'red';

var storage = window.sessionStorage;
const socket = new WebSocket('ws://localhost:8082');

socket.addEventListener('message',(msg)=>{
    var data = JSON.parse(msg.data);

    if (data.type === 'setToken') {
        storage.setItem('token', data.token);
    }
    else if (data.type === 'drawWithStyle') {
        for (const i in data.points) {
            drawWithStyle(data.points[i][0],data.points[i][1]);
        }
    }
    else if(data.type === 'undrawLine'){
        undrawLine(data.score,data.speed,data.maxScore,data.maxSpeed);
    }
    else if(data.type === 'setID'){
        id = data.id;
        grid();
    }
});

function importCSV(csv){
    const reader = new FileReader;
    reader.addEventListener('load', () => {
        let rows = reader.result.split(/\r?\n|\r/);
        let users = {user: []};
        for (let row in rows) {
            let dict = {};
            let columns = rows[row].split(',');
            dict['login'] = columns[0];
            dict['email'] = columns[1];
            dict['password'] = columns[2];
            dict['maxSpeed'] = columns[3];
            dict['maxScore'] = columns[4];
            dict['carColor'] = columns[5];
            users.user.push(dict);
        }
        users.user.splice(0,1);
        const myInit = {
            method: 'POST',
            mode: 'cors',
            cache: 'default',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'users': users}),
        };
        console.log(users);
        let myRequest = new Request('http://localhost:8080/import');
        fetch(myRequest, myInit).then(function (response) {
            response.json().then(() => {});
        });
    });
    reader.readAsText(csv, 'UTF-8');
}

function convertToCsv(arr) {
    const array = [Object.keys(arr[0])].concat(arr)

    return array.map(it => {
        return Object.values(it).toString()
    }).join('\n')
}

const downloadFile = (fileName, data) => {
    var link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
    link.setAttribute('download', fileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


function adminControl(){
    var down = document.createElement('button');
    down.innerText = 'Download csv';
    var upl = document.createElement('input');
    upl.type = 'button';
    upl.value = 'Import csv';
    var myFileInput = document.createElement('input');
    myFileInput.id = 'myFileInput';
    myFileInput.type = 'file';
    myFileInput.style.display = 'none';
    myFileInput.onchange = () => {
        const selectedFiles = myFileInput.files[0];
        importCSV(selectedFiles);
    }
    const tbl = document.createElement("table");
    tbl.id = 'table';
    const tblBody = document.createElement("tbody");
    var users;
    const myInit = {
        method: 'POST',
        mode: 'cors',
        cache: 'default',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let myRequest = new Request('http://localhost:8080/players');
    fetch(myRequest, myInit).then(function (response) {
        response.json().then(data => {
            users = data.players;
            users = JSON.parse(users)
            const names = ['login','email','password(hash)','maxScore','maxSpeed'];
            let row;
            let cell;
            let cellText;
            row = document.createElement("tr");
            for(const i in names){
                cell = document.createElement("td");
                cellText = document.createTextNode(names[i]);
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            tblBody.appendChild(row);

            for (let i = 0; i < Object.keys( users.user ).length; i++) {
                row = document.createElement("tr");

                cell = document.createElement("td");
                cellText = document.createTextNode(users.user[i].login);
                cell.appendChild(cellText);
                row.appendChild(cell);
                cell = document.createElement("td");
                cellText = document.createTextNode(users.user[i].email);
                cell.appendChild(cellText);
                row.appendChild(cell);
                cell = document.createElement("td");
                cellText = document.createTextNode(users.user[i].password);
                cell.appendChild(cellText);
                row.appendChild(cell);
                cell = document.createElement("td");
                cellText = document.createTextNode(users.user[i].maxScore);
                cell.appendChild(cellText);
                row.appendChild(cell);
                cell = document.createElement("td");
                cellText = document.createTextNode(users.user[i].maxSpeed);
                cell.appendChild(cellText);
                row.appendChild(cell);
                cell = document.createElement("button");
                cell.addEventListener('click',() => {
                    deletePlayer(users.user[i].login)
                });
                cell.innerText = 'Delete';
                row.appendChild(cell);
                tblBody.appendChild(row);
            }
            down.addEventListener('click', () =>{
                downloadFile('players',convertToCsv(users.user));
            })
            upl.addEventListener('click', () =>{
                document.getElementById('myFileInput').click();

            })
        });
    });

    tbl.appendChild(tblBody);
    tbl.appendChild(down);
    tbl.appendChild(upl);
    tbl.appendChild(myFileInput);
    document.body.appendChild(tbl);
    tbl.setAttribute("border", "2");
}

function logout(){
    var swLogout = document.createElement('a');
    swLogout.setAttribute('href', '#');
    swLogout.innerHTML = 'Logout';
    swLogout.addEventListener('click', () => {
        document.body.innerHTML = '';
        socket.send(JSON.stringify({'type': 'logout', 'id': id, 'token': storage.getItem('token')}));
    });
    return swLogout
}

function loginForm(){
    var login = document.createElement('div');
    login.id = 'login';
    login.style.float = 'left';
    login.style.border = '2px solid';

    var name = document.createElement('p');
    name.innerText = 'Name';

    var nameInput = document.createElement('input');
    nameInput.name = 'login';

    var password = document.createElement('p');
    password.innerText = 'Password';

    var passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.name = 'password';

    var button = document.createElement('button');
    button.innerText = 'Log in';
    button.addEventListener('click',() =>{
        const myInit = {
            method: 'POST',
            mode: 'cors',
            cache: 'default',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'login': nameInput.value, 'password': passwordInput.value, 'token': storage.getItem('token')}),
        };

        let myRequest = new Request('http://localhost:8080/login');
        fetch(myRequest, myInit).then(function (response) {
            response.json().then(data => {
                if(data.type === 'success'){
                    carColor = data.carColor;
                    document.getElementById('login').remove();
                    document.getElementById('logged').innerText = 'Logged: ' + data.user;
                    document.getElementById('divForm').appendChild(logout());
                    if(data.user === 'admin'){
                        document.getElementById('game-container').remove();
                        gameStop();
                        adminControl();
                    }
                }
                else if(data.type === 'fail'){
                    alert(data.message);
                }
            });
        });
    })

    var token = document.createElement('input');
    token.type = 'hidden';
    token.name = 'token';
    token.setAttribute('value', storage.getItem('token'));

    var swRegister = document.createElement('a');
    swRegister.setAttribute('href', '#');
    swRegister.innerHTML = 'Switch to Register';
    swRegister.addEventListener('click', () => {
        login.remove();
        document.getElementById('divForm').appendChild(registerForm());
    });

    login.appendChild(name);
    login.appendChild(nameInput);
    login.appendChild(password);
    login.appendChild(passwordInput);
    login.appendChild(button);
    login.appendChild(swRegister);
    login.appendChild(token);
    return login;
}

function registerForm(){
    var register = document.createElement('div');
    register.id = 'register';
    register.style.float = 'left';
    register.style.border = '2px solid';

    var mail = document.createElement('p');
    mail.innerText = 'E-mail';

    var mailInput = document.createElement('input');
    mailInput.name = 'email';

    var name = document.createElement('p');
    name.innerText = 'Name';

    var nameInput = document.createElement('input');
    nameInput.name = 'login';

    var password1 = document.createElement('p');
    password1.innerText = 'Password';

    var passwordInput1 = document.createElement('input');
    passwordInput1.type = 'password';
    passwordInput1.name = 'password';

    var password2 = document.createElement('p');
    password2.innerText = 'Password again';

    var passwordInput2 = document.createElement('input');
    passwordInput2.type = 'password';
    passwordInput2.name = 'password2';

    var button = document.createElement('button');
    button.innerText = 'Register';
    button.addEventListener('click',() =>{
        const myInit = {
            method: 'POST',
            mode: 'cors',
            cache: 'default',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'login': nameInput.value, 'email': mailInput.value, 'password': passwordInput1.value,  'password2': passwordInput2.value, 'token': storage.getItem('token')}),
        };

        let myRequest = new Request('http://localhost:8080/register');
        fetch(myRequest, myInit).then(function (response) {
            response.json().then(data => {
                if(data.type === 'success'){
                    document.getElementById('register').remove();
                    document.getElementById('divForm').appendChild(loginForm());
                }
                else if(data.type === 'fail'){
                    alert(data.message);
                }
            });

        });
    })

    var token = document.createElement('input');
    token.type = 'hidden';
    token.name = 'token';
    token.setAttribute('value', storage.getItem('token'));

    var swLogin = document.createElement('a');
    swLogin.setAttribute('href', '#');
    swLogin.innerHTML = 'Switch to Login';
    swLogin.addEventListener('click', () => {
        register.remove();
        document.getElementById('divForm').appendChild(loginForm());
    });

    register.appendChild(name);
    register.appendChild(nameInput);
    register.appendChild(mail);
    register.appendChild(mailInput);
    register.appendChild(password1);
    register.appendChild(passwordInput1);
    register.appendChild(password2);
    register.appendChild(passwordInput2);
    register.appendChild(button);
    register.appendChild(swLogin);
    register.appendChild(token);
    return register;
}

// drawing game
function grid() {
    var logged = document.createElement('h3');
    logged.id = 'logged';
    logged.innerText = 'Logged: [N/A]';
    document.body.appendChild(logged);
    var divForm = document.createElement('div');
    divForm.id = 'divForm';
    divForm.appendChild(loginForm());
    document.body.appendChild(divForm);
    var info_speed = document.createElement('h2');
    info_speed.id = 'info_speed';
    var info_score = document.createElement('h2');
    info_score.id = 'info_score';
    var info_maxSpeed = document.createElement('h2');
    info_maxSpeed.id = 'info_maxSpeed';
    var info_maxScore = document.createElement('h2');
    info_maxScore.id = 'info_maxScore';
    var button_reset = document.createElement('button');
    button_reset.innerHTML = "Reset";
    button_reset.addEventListener("click", game_reset);
    var red_car = document.createElement('button');
    red_car.innerHTML = "Red car";
    red_car.addEventListener("click", () => {
        carColor = 'red';
        colorChange('red');
    });
    var orange_car = document.createElement('button');
    orange_car.innerHTML = "Orange car";
    orange_car.addEventListener("click", () => {
        carColor = 'orange';
        colorChange('orange');
    });
    var blue_car = document.createElement('button');
    blue_car.innerHTML = "Blue car";
    blue_car.addEventListener("click", () => {
        carColor = 'blue';
        colorChange('blue');
    });

    var info_div = document.createElement('div');
    info_div.appendChild(info_speed);
    info_div.appendChild(info_score);
    info_div.appendChild(info_maxSpeed);
    info_div.appendChild(info_maxScore);
    info_div.appendChild(button_reset);
    info_div.appendChild(red_car);
    info_div.appendChild(orange_car);
    info_div.appendChild(blue_car);


    var gameContainer = document.createElement('div');
    gameContainer.innerHTML = '';
    gameContainer.id = 'game-container';
    gameContainer.style.float = 'left';
    document.body.appendChild(gameContainer);
    gameContainer.appendChild(info_div);
    gameContainer.appendChild(canvas);
}

function drawWithStyle(coords, style) {
    if (style === 'wheel') {
        ctx.fillStyle = "black";
    }
    else if (style === 'car'){
        ctx.fillStyle = carColor;
    }
    else if (style === 'road'){
        ctx.fillStyle = "gray";
    }
    else if (style === 'red'){
        ctx.fillStyle = "red";
    }
    else if (style === 'white'){
        ctx.fillStyle = "white";
    }
    for (var i = 0; i < coords.length; i++) {
        var x = coords[i][0];
        var y = coords[i][1];
        ctx.fillRect(x*pixelSize, y*pixelSize, pixelSize, pixelSize);
    }
}

function undrawLine(score,speed,maxScore,maxSpeed) {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById('info_speed').innerHTML = 'Speed ' + speed;
    document.getElementById('info_score').innerHTML = 'Score ' + score;
    document.getElementById('info_maxSpeed').innerHTML = 'Max Speed ' + maxSpeed;
    document.getElementById('info_maxScore').innerHTML = 'Max Score ' + maxScore;
}

document.addEventListener('keydown',function(ev){
    if (ev.keyCode === 38 || ev.keyCode === 73) {
        sendKey(-1);
    }
    else if (ev.keyCode === 40 || ev.keyCode === 75) {
        sendKey(1);
    }
});

function sendKey(direction){
    const myInit = {
        method: 'POST',
        mode: 'cors',
        cache: 'default',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'id': id, 'direction': direction }),
    };

    let myRequest = new Request('http://localhost:8080/move');
    fetch(myRequest, myInit).then(function (response) {
        response.json().then(() => {});
    });
}

function deletePlayer(login){
    const myInit = {
        method: 'POST',
        mode: 'cors',
        cache: 'default',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'login': login}),
    };

    let myRequest = new Request('http://localhost:8080/deletePlayer');
    fetch(myRequest, myInit).then(function (response) {
        response.json().then(data => {
            if(data.type === 'fail'){
                alert(data.message);
            }
            else {
                document.getElementById('table').remove();
                adminControl();
            }
        });
    });
}

function colorChange(color){
    const myInit = {
        method: 'POST',
        mode: 'cors',
        cache: 'default',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'id': id, 'token': storage.getItem('token'), 'color': color}),
    };

    let myRequest = new Request('http://localhost:8080/colorChange');
    fetch(myRequest, myInit).then(function (response) {
        response.json().then(data => {});
    });
}

function game_reset(){
    socket.send(JSON.stringify({'type': 'reset', 'id': id, 'token': storage.getItem('token')}));
}

function gameStop(){
    socket.send(JSON.stringify({'type': 'stop', 'id': id, 'token': storage.getItem('token')}));
}

