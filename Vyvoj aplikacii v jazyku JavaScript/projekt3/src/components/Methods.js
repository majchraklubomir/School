import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {ExportToCsv} from "export-to-csv";
function Methods() {
    const navigate = useNavigate();
    const [methods, setMethods] = useState([]);
    const [method, setMethod] = useState(null);
    const [description, setDescription] = useState(null);
    const ref = useRef();
    useEffect(() => {
        getMethods();
    }, []);

    function getMethods() {
        axios.post('/getMethods',{
            userid: localStorage.getItem('id')
        }).then(r=>setMethods(r.data))
    }

    const deleteMethod = (index) => {
        axios.post('/deleteMethod',{
            id: methods[index].id,
        }).then(r=>{getMethods()});
    }


    const handleDescription = (e) => (
        setDescription(e.target.value)
    );
    const handleMethod = (e) => (
        setMethod(e.target.value)
    );

    const addMethod = (e) => {
        e.preventDefault();
        axios.post('/addMethod', {
            name: method,
            description: description,
            userid: localStorage.getItem('id')
        }).then(r => {
            getMethods()
        })
    }

    function  renderMethods() {
        return methods.map((meth, index) => {
            return (
                <tr key={index}>
                    <td>{meth.nazov}</td>
                    <td>{meth.popis}</td>
                    <td><button onClick={() => {
                        deleteMethod(index)
                    }}>Zmazat</button></td>
                </tr>
            );
        });
    }

    const handleNavigate = () =>{
        navigate('/user');
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
                dict['name'] = columns[1];
                dict['description'] = columns[2];
                dict['userid'] = columns[3];
                users.user.push(dict);
            }
            users.user.splice(0,1);
            axios.post('/importMethods',users).then(r => {getMethods()});
        });
        reader.readAsText(csv, 'UTF-8');
    }
    function downloadFile(){
        const csvExporter = new ExportToCsv(options);
        csvExporter.generateCsv(methods);
    }
    return(
        <div>
            <h2>USER: {JSON.parse(localStorage.getItem('name'))}</h2>
            <button onClick={handleLogout}>LOGOUT</button>
            <div>
                <h3>Methods</h3>
                <button onClick={handleNavigate}>Navigate to measurements</button>
                <table border='1'>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    { renderMethods() }
                    <button onClick={downloadFile}>Download csv</button>
                    <input id={'file'} ref={ref} type={'file'} style={{display: 'none'}} onChange={handleFile}/>
                    <button onClick={uploadFile}>Import csv</button>
                </table>
                <h3>Add new method</h3>
                <form onSubmit={addMethod}>
                    <div>Method name: </div>
                    <input required={true} type={'text'} placeholder={'Method name'} value={method} onChange={handleMethod}/><br/>
                    <div>Description: </div>
                    <input required={true} type={'text'} placeholder={'Description'} value={description} onChange={handleDescription}/><br/>
                    <button type='submit'>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default Methods;