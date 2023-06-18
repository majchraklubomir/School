import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import { ExportToCsv } from 'export-to-csv';
import {useNavigate} from "react-router-dom";
function Admin() {
    const navigate = useNavigate();
    const [adLink, setAdLink] = useState(null);
    const [redirectLink, setRedirectLink] = useState(null);
    const [users, setUsers] = useState([]);
    const [counter, setCounter] = useState(0);
    const ref = useRef();
    useEffect(() => {
        getUsers();
        getCounter();
    }, []);
    function getUsers() {
        axios.get('/getUsers').then(r=>setUsers(r.data))
    }

    function getCounter() {
        axios.get('/getCounter').then(r=>setCounter(r.data[0].pocitadlo))
    }

    function setAd(e) {
        e.preventDefault()
        axios.post('/setAd',{
            ad: adLink,
            redir: redirectLink
        }).then(r=>{})
    }

    const handleAdLink = (e) => (
        setAdLink(e.target.value)
    );
    const handleRedirectLink = (e) => (
        setRedirectLink(e.target.value)
    );

    function deleteUser(index){
        if(users[index].email !=='admin@admin.admin'){
            axios.post('/deleteUser',{
                email: users[index].email
            }).then(r => getUsers());
        }
    }
    function renderUsers() {
        return users.map((user, index) => {
            return (
                <tr key={index}>
                    <td>{user.meno}</td>
                    <td>{user.email}</td>
                    <td>{user.heslo}</td>
                    <td>{user.vek}</td>
                    <td>{user.vyska}</td>
                    <td><button onClick={() => {
                        deleteUser(index)
                    }}>Zmazat</button></td>
                </tr>
            );
        });
    }
    const handleLogout = () => {
        localStorage.removeItem('name');
        localStorage.removeItem('id');
        navigate('/',{replace: true});
    }

    const options = {
        fieldSeparator: ',',
        decimalSeparator: '.',
        showLabels: true,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
    };
    const uploadFile = () => {
        document.getElementById('file').click();
    }
    const handleFile = (e) => {
        importCSV(e.target.files[0]);
        e.target.value = '';
    }
    const importCSV = csv =>{
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            let rows = reader.result.split(/\r?\n|\r/);
            let users = {user: []};
            for (let row in rows) {
                let dict = {};
                let columns = rows[row].split(',');
                dict['name'] = columns[0];
                dict['password'] = columns[1];
                dict['email'] = columns[2];
                dict['age'] = columns[3];
                dict['height'] = columns[4];
                users.user.push(dict);
            }
            users.user.splice(0,1);
            axios.post('/import',users).then(r => {getUsers()});
        });
        reader.readAsText(csv, 'UTF-8');
    }
    function downloadFile(){
        const csvExporter = new ExportToCsv(options);
        csvExporter.generateCsv(users);
    }


    const [name, setName] = useState(null);
    const [age, setAge] = useState(null);
    const [height, setHeight] = useState(null);
    const [email, setEmail] = useState(null);
    const [password,setPassword] = useState(null);
    const [confirmPassword,setConfirmPassword] = useState(null);

    const handleName = (e) => (
        setName(e.target.value)
    );
    const handleEmail = (e) => (
        setEmail(e.target.value)
    );
    const handleHeight = (e) => (
        setHeight(e.target.value)
    );
    const handleAge = (e) => (
        setAge(e.target.value)
    );
    const handlePassword = (e) => (
        setPassword(e.target.value)
    );
    const handleConfirmPassword = (e) => (
        setConfirmPassword(e.target.value)
    );
    const handleRegister = (e) =>{
        e.preventDefault();
        if(age > 0 && age < 150 && height > 0 && height < 400){
            if(password === confirmPassword){
                axios.post('/register', {
                    name: name,
                    email: email,
                    age: age,
                    height: height,
                    password: password
                }).then(r => {
                    getUsers()
                })
            }
        }
    };

    return(
        <div>
            <h2>ADMIN</h2>
            <button onClick={handleLogout}>LOGOUT</button>
            <div>
                <h3>Setup advertisement</h3>
                <form onSubmit={setAd}>
                    <div>Link to picture: </div>
                    <input required={true} type={'text'} placeholder={'Ad image link'} value={adLink} onChange={handleAdLink}/><br/>
                    <div>Where the AD will redirect: </div>
                    <input required={true} type={'text'} placeholder={'Redirect link'} value={redirectLink} onChange={handleRedirectLink}/><br/>
                    <button type='submit'>Submit</button>
                </form>
                <h3>AD clicked = {counter}</h3>
            </div>
            <div>
                <h3>Users</h3>
                <table border='1'>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Age</th>
                        <th>Height</th>
                    </tr>
                    </thead>
                    <tbody>
                        { renderUsers() }
                    </tbody>
                    <tfoot>
                        <button onClick={downloadFile}>Download csv</button>
                        <input id={'file'} ref={ref} type={'file'} style={{display: 'none'}} onChange={handleFile}/>
                        <button onClick={uploadFile}>Import csv</button>
                    </tfoot>
                </table>
            </div>
            <div>
                <h3>Add new user</h3>
                <form onSubmit={handleRegister}>
                    <div>Name: </div>
                    <input required={true} id={'name'} type={'text'} placeholder={'Enter your name'} value={name} onChange={handleName}/> <br/>
                    <div>Email: </div>
                    <input required={true} id={'email'} type={'email'} placeholder={'Enter your email'} value={email} onChange={handleEmail}/> <br/>
                    <div>Age: </div>
                    <input required={true} id={'age'} type={'number'} placeholder={'Enter your age in years'} value={age} onChange={handleAge}/> <br/>
                    <div>Height: </div>
                    <input required={true} id={'height'} type={'number'} placeholder={'Enter your height in cm'} value={height} onChange={handleHeight}/> <br/>
                    <div>Password: </div>
                    <input required={true} id={'password'} type={'password'} placeholder={'Enter your password'} value={password} onChange={handlePassword}/> <br/>
                    <div>Password again: </div>
                    <input required={true} id={'confirmPassword'} type={'password'} placeholder={'Enter your password again'} value={confirmPassword} onChange={handleConfirmPassword}/> <br/>
                    <button type={'submit'} >Register</button> <br/>
                </form>
            </div>
        </div>
    )
}

export default Admin;