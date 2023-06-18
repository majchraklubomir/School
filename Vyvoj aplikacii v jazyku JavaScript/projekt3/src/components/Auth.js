import React, {useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Auth() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [email, setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const [authMode, setAuthMode] = useState('login');
    const navigate = useNavigate();

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
                    if(r.status === 200){
                        setAuthMode('login');
                    }
                })
            }
        }
    };
    const handleLogin =  (e) => {
        e.preventDefault();
        axios.post('/login', {
            email: email,
            password: password
        }).then(r => {
            if(r.status === 200){
                localStorage.setItem('name', JSON.stringify(r.data.name));
                localStorage.setItem('id', JSON.stringify(r.data.id));
                if(r.data.name === 'admin'){
                    navigate('/admin',{replace: true});
                }
                else{
                    navigate('/user',{replace: true});
                }
            }
        })
    };

    const changeAuthMode = () => {
        setName('');
        setAge('');
        setHeight('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAuthMode(authMode === 'login' ? 'register' : 'login')
    }

    if (authMode === 'register'){
        return(
            <div>
                <h3>Registration</h3>
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
                    <div>Already have account? {" "}
                        <span id={'changeAuth'} onClick={changeAuthMode}><h5>Login</h5></span>
                    </div>
                </form>
            </div>
        );
    }
    if (authMode === 'login'){
        return (
            <div>
                <h3>Login</h3>
                <form onSubmit={handleLogin}>
                    <div>Email: </div>
                    <input required={true} id={'email'} type={'email'} placeholder={'Enter your email'} value={email} onChange={handleEmail}/>
                    <div>Password: </div>
                    <input required={true} id={'password'} type={'password'} placeholder={'Enter your password'} value={password} onChange={handlePassword}/>
                    <button type={'submit'}>Login</button>
                    <div>Not registered? {" "}
                        <span id={'changeAuth'} onClick={changeAuthMode}><h5>Register</h5></span>
                    </div>
                </form>
            </div>
        )
    }
}

export default Auth;