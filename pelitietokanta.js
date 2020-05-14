//pelikanta.js
'use strict';

const Tietokanta = require('./tietokanta.js');

const ohjelmavirhe = () => new Error('Ohjelmavirhe');

const pelintiedot = peli => [
    peli.numero, peli.nimi, peli.arvostelu,
    peli.genre, peli.vuosi
];

const pelitiedotPaivitykseen = peli => [
    peli.nimi, peli.arvostelu,
    peli.genre, peli.vuosi, peli.numero
];

//Sql-lauseet
const haeKaikkiSql='select numero, nimi, arvostelu, genre, vuosi from peli';
const haepeliSql=
  'select numero, nimi, arvostelu, genre, vuosi from peli where numero=?';
const lisaapeliSql=
  'insert into peli(numero,nimi, arvostelu, genre, vuosi) values(?,?,?,?,?)';
const poistapeliSql='delete from peli where numero=?';
const paivitapeliSql=
  'update peli set nimi=?, arvostelu=?, genre=?, vuosi=? where numero=?';



//pelikanta-luokka
module.exports = class pelikanta {

    constructor(optiot) {
        this.varasto=new Tietokanta(optiot);
    }

    //metodit
    //palauttaa lupauksen
    haeKaikki() {
        return new Promise(async (resolve, reject) => {
            try{
                const tulos = await this.varasto.suoritaKysely(haeKaikkiSql);
                if(tulos.tulosjoukko) {
                    resolve(tulos.kyselynTulos);
                }
                else {
                    reject(ohjelmavirhe());
                }
            }
            catch(virhe) {
                reject(ohjelmavirhe());
            }
        });
    }

    //palauttaa lupauksen
    hae(pelinumero) {
        return new Promise(async (resolve,reject)=>{
            try{
                const tulos= await this.varasto.suoritaKysely(haepeliSql,[+pelinumero]);
                if(tulos.tulosjoukko){
                    if(tulos.kyselynTulos.length>0) {
                        resolve(tulos.kyselynTulos[0]);
                    }
                    else {
                        resolve({ viesti:`Numerolla ${pelinumero} ei löytynyt peliä`});
                    }
                }
                else {
                    reject(ohjelmavirhe());
                }
            }
            catch(virhe){
                reject(ohjelmavirhe());
            }
        });
    }
    
    //palauttaa lupauksen
    lisaa(peli) {
        return new Promise(async (resolve,reject)=>{
            try{
                console.log(peli);
                const hakutulos= 
                    await this.varasto.suoritaKysely(haepeliSql,[peli.numero]);
                if(hakutulos.kyselynTulos.length===0) {
                    const tulos= await this.varasto.suoritaKysely(lisaapeliSql,
                        pelintiedot(peli));
                    if(tulos.kyselynTulos.muutetutRivitLkm === 1){
                        resolve({ viesti: `Peli numerolla ${peli.numero} lisättiin`});
                    }
                    else {
                        resolve({ viesti:'Peliä ei lisätty'});
                    }
                }
                else {
                    resolve({ viesti: `Pelinumero ${peli.numero} oli jo käytössä`});
                }
            }
            catch(virhe) {
                console.log(virhe.message);
                reject(ohjelmavirhe());
            }
        });
    }

    //palauttaa lupauksen
    poista(numero) {
        return new Promise(async (resolve,reject)=>{
            try{
                const tulos= await this.varasto.suoritaKysely(poistapeliSql,
                                                              [+numero]);
                if(tulos.kyselynTulos.muutetutRivitLkm===0){
                    resolve({ viesti: 'Antamallasi numerolla ei löytynyt '+
                                      'Peliä. Mitään ei poistettu'});
                }
                else {
                    resolve({ viesti: `Peli numerolla ${numero} poistettiin`})
                }                                             
            }
            catch(virhe) {
                reject(ohjelmavirhe())
            }
        });
    }

    //palauttaa lupauksen
    paivita(peli) {
        return new Promise(async (resolve, reject)=>{
            try{
                const tulos= await this.varasto.suoritaKysely(paivitapeliSql,
                    pelitiedotPaivitykseen(peli));
                if(tulos.kyselynTulos.muutetutRivitLkm === 0) {
                    resolve({ viesti:'Tietoja ei päivitetty'});
                }
                else {
                    resolve({ viesti: `Pelin ${peli.numero} tiedot päivitettiin`});
                }
            }
            catch(virhe) {
                reject(ohjelmavirhe());
            }
        });
    }

}