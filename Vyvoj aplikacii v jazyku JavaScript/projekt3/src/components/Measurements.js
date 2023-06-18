import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {ExportToCsv} from "export-to-csv";
function Measurements() {
    const navigate = useNavigate();
    const [meas, setMeas] = useState([]);
    const [measuredValue, setMeasuredValue] = useState(null);
    const [methods, setMethods] = useState([]);
    const [method, setMethod] = useState(null);
    const [date, setDate] = useState(null);
    const [filter, setfilter] = useState(null);
    const ref = useRef();
    useEffect(() => {
        getMeasurements();
        getMethods();
    }, []);

    function getMeasurements() {
        axios.post('/getMeasurements',{
            userid: localStorage.getItem('id')
        }).then(r=>setMeas(r.data))
    }

    function getMethods() {
        axios.post('/getMethods',{
            userid: localStorage.getItem('id')
        }).then(r=>setMethods(r.data))
    }

    const deleteMeasurement = (index) => {
        axios.post('/deleteMeasurement',{
            id: meas[index].id
        }).then(r=>{getMeasurements()});
    }

    function addMeasurement(e){
        e.preventDefault();
        if(method === 'None' || method === null || measuredValue < 1){
            return;
        }
        axios.post('/addMeasurement', {
            value: measuredValue,
            method: method,
            date: date,
            userid: localStorage.getItem('id')
        }).then(r => {
            getMeasurements()
        })
    }

    function renderMeasurements() {
        return meas.map((mes, index) => {
            return (
                <tr key={index}>
                    <td>{mes.hodnota}</td>
                    <td>{mes.metoda}</td>
                    <td>{mes.datum}</td>
                    <td><button onClick={() => {
                        deleteMeasurement(index)
                    }}>Zmazat</button></td>
                </tr>
            );
        });
    }
    const handleFilter = (e) => {
        setfilter(e.target.value);
    };
    const handleMeasuredValue = (e) => (
        setMeasuredValue(e.target.value)
    );
    const handleMethod = (e) => (
        setMethod(e.target.value)
    );
    const handleDate = (e) => (
        setDate(e.target.value)
    );

    const handleNavigateMethods = () =>{
        navigate('/methods');
    }

    const handleNavigateGraph = () =>{
        navigate('/graph');
    }
    const handleLogout = () => {
        localStorage.removeItem('name');
        localStorage.removeItem('id');
        navigate('/',{replace: true});
    }

    function selectMethod() {
        return (
            methods.map((option,index) =>
                <option key={index} value={option.nazov}>
                    {option.nazov}
                </option>)
        );
    }

    const filterRows = (e) => {
        e.preventDefault();
        if (filter === 'None' || filter === null){
            getMeasurements();
            return;
        }
        axios.post('/filter', {
            filter: filter,
            userid: localStorage.getItem('id')
        }).then(r=>setMeas(r.data))
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
                dict['value'] = columns[1];
                dict['method'] = columns[2];
                dict['date'] = columns[3];
                dict['userid'] = columns[4];
                users.user.push(dict);
            }
            users.user.splice(0,1);
            axios.post('/importMeasurements',users).then(r => {getMeasurements()});
        });
        reader.readAsText(csv, 'UTF-8');
    }
    function downloadFile(){
        const csvExporter = new ExportToCsv(options);
        csvExporter.generateCsv(meas);
    }
    return(
        <div>
            <h2>USER: {JSON.parse(localStorage.getItem('name'))}</h2>
            <button onClick={handleLogout}>LOGOUT</button>
            <div>
                <h3>Measurements</h3>
                <button onClick={handleNavigateMethods}>Navigate to user methods</button>
                <button onClick={handleNavigateGraph}>Navigate to Graph</button>
                <table border="1">
                    <thead>
                    <tr>
                        <th>Filter by: </th>
                        <select value={filter} onChange={handleFilter}><option>None</option>{selectMethod()}</select>
                        <button onClick={filterRows}>FILTER!</button>
                    </tr>
                    <tr>
                        <th>Value</th>
                        <th>Method</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    { renderMeasurements() }
                    <button onClick={downloadFile}>Download csv</button>
                    <input id={'file'} ref={ref} type={'file'} style={{display: 'none'}} onChange={handleFile}/>
                    <button onClick={uploadFile}>Import csv</button>
                </table>
                <h3>Add new measurement</h3>
                <form onSubmit={addMeasurement}>
                    <div>Measured value: </div>
                    <input required={true} type={'number'} placeholder={'Measured value'} value={measuredValue} onChange={handleMeasuredValue}/><br/>
                    <div>Method: </div>
                    <select value={method} onChange={handleMethod}><option>None</option>{selectMethod()}</select><br/>
                    <div>Date: </div>
                    <input required={true} type={'date'} placeholder={'Date'} value={date} onChange={handleDate}/><br/>
                    <button type='submit'>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default Measurements;