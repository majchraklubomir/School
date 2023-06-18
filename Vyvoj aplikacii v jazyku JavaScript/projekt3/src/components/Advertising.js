import React, {useEffect, useState} from "react";
import axios from "axios";

function Graph() {
    const [ad, setAd] = useState(null);
    useEffect(() => {
        const interval = setInterval(() => {
            getAd();
        }, 60000);
        return () => clearInterval(interval);
    }, []);


    function getAd(){
        axios.get('/getAd').then(r => {
            setAd(r.data);
        })
    }

    function updateCounter(){
        ad[0].pocitadlo += 1;
        axios.post('/updateCounter', {
            counter: ad[0].pocitadlo
        }).then(r  =>{
            setAd(null);
        });
    }
    if(ad !== null){
        return (
            <div>
                <a onClick={updateCounter} href={ad[0].link_ciel} target={'_blank'}><img alt={''} src={ad[0].link_obrazok} /></a>
            </div>
        );
    }
}

export default Graph;