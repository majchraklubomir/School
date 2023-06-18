import React, {useEffect, useState} from "react";
import { Line } from "react-chartjs-2";
import Chart from 'chart.js/auto';
import {CategoryScale} from 'chart.js';
import axios from "axios";
import { useNavigate } from "react-router-dom";
Chart.register(CategoryScale);

function Graph() {
    const navigate = useNavigate();
    const [timeStart, setTimeStart] = useState(null);
    const [timeEnd, setTimeEnd] = useState(null);
    const [data, setData] = useState([]);
    const [dates, setDates] = useState([])
    useEffect(() => {
        getData();
    }, []);

    const dataset = {
        labels: data.map(item => {return item.datum}),
        datasets: [
            {
                data: data.map(item => {return item.hodnota}),
                borderColor: 'rgb(119,168,92)',
                backgroundColor: 'rgba(131,97,97,0.5)',
            }
        ],
    };

    function getData(){
        axios.post('/getData', {
            userid: localStorage.getItem('id')
        }).then(r => {
            setData(r.data);
            setDates(r.data)
        })
    }

    function getDataRange(){
        if(timeStart === null || timeEnd === null || timeStart === 'None' || timeEnd === 'None'){
            getData();
            return;
        }
        axios.post('/getDataRange', {
            userid: localStorage.getItem('id'),
            timeStart: timeStart,
            timeEnd: timeEnd
        }).then(r => setData(r.data))
    }

    const handleLogout = () => {
        localStorage.removeItem('name');
        localStorage.removeItem('id');
        navigate('/',{replace: true});
    }

    const handleRedirect = () => {
        navigate('/user');
    }
    function selectRange() {
        return (
            dates.map((option,index) =>
                <option key={index} value={option.datum}>
                    {option.datum}
                </option>)
        );
    }

    const handleStart = (e) => (
        setTimeStart(e.target.value)
    );

    const handleEnd = (e) => (
        setTimeEnd(e.target.value)
    );

    function renderMeasurements() {
        return data.map((mes, index) => {
            return (
                <tr key={index}>
                    <td>{mes.hodnota}</td>
                    <td>{mes.metoda}</td>
                    <td>{mes.datum}</td>
                </tr>
            );
        });
    }

    return (
        <div>
            <h2>USER: {JSON.parse(localStorage.getItem('name'))}</h2>
            <button onClick={handleLogout}>LOGOUT</button>
            <button onClick={handleRedirect}>Go back to measurements</button>
            <div>
                <h3>Select time range</h3>
                <div>From: <select value={timeStart} onChange={handleStart}><option>None</option>{selectRange()}</select></div>
                <div>To: <select value={timeEnd} onChange={handleEnd}><option>None</option>{selectRange()}</select></div>
                <button onClick={getDataRange}>SHOW!</button>
                <Line data={dataset} />
            </div>
            <div>
                <h3>Measurements</h3>
                <table border='1'>
                    <thead>
                    <tr>
                        <th>Value</th>
                        <th>Method</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    { renderMeasurements() }
                </table>
            </div>
        </div>
    );
}

export default Graph;