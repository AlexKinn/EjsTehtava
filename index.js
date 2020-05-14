'use strict';
const http = require('http');
const path = require('path');

const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const Tietovarasto = require('./pelitietokanta.js');

const optiot = {
    host: 'localhost',
    port: 3306,
    user: 'ellen',
    password: '2R8RtZDL',
    database: 'pWiDuTGaX'
};

const pelivarasto = new Tietovarasto(optiot);

const palvelin = http.createServer(app);

const valikkopolku = path.join(__dirname,'valikko.html');


app.use(express.static(path.join(__dirname,'resurssit')));

const palvelinvirhe = res => res.status(500).render('virhesivu', {
    viesti: 'Palvelimen virhe'
});

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'sivumallit'));
app.use(express.static(path.join(__dirname, 'resurssit')));

app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => res.sendFile(valikkopolku));
app.get('/kaikki', async(req, res) => {
    try {
        const tulos = await pelivarasto.haeKaikki();
        res.render('haeKaikki', {
            pelit: tulos
        });
    } catch (virhe) {
        res.render('virhesivu', {
            viesti: virhe.message
        });
    }
});
app.get('/hae', (req, res) => {
    res.render('haeYksi', {
        paaotsikko: 'Pelin haku',
        otsikko: 'Syötä numero',
        toiminto: '/hae'
    });
});

app.post('/hae', async(req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    } else {
        try {
            const tulos = await pelivarasto.hae(req.body.numero);
            if (tulos.viesti) {
                res.render('tilasivu', {
                    paaotsikko: 'Hakutulos',
                    otsikko: 'Viesti',
                    viesti: tulos.viesti
                });
            } else {
                res.render('hakutulos', {
                    peli: tulos
                });
            }
        } catch (virhe) {
            res.render('virhesivu', {
                viesti: virhe.message
            });
        }
    }
});

app.get('/poista', (req, res) => {
    res.render('haeYksi', {
        paaotsikko: 'Pelin haku',
        otsikko: 'Syötä numero',
        toiminto: '/poista'
    });
});

app.post('/poista', async(req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    } else {
        try {
            const tulos = await pelivarasto.poista(req.body.numero);
            res.render('tilasivu', {
                paaotsikko: 'Poiston tulos',
                otsikko: 'Viesti',
                viesti: tulos.viesti
            });
        } catch (virhe) {
            res.render('virhesivu', {
                viesti: virhe.message
            });
        }
    }
});

app.get('/lisaa', (req, res) => {
    res.render('lomake', {
        paaotsikko: 'Pelin lisäys',
        otsikko: 'Syötä tiedot',
        toiminto: '/lisaa',
        numero: {
            arvo: '',
            vainluku: ''
        },
        nimi: {
            arvo: '',
            vainluku: ''
        },
        arvostelu: {
            arvo: '',
            vainluku: ''
        },
        genre: {
            arvo: '',
            vainluku: ''
        },
        vuosi: {
            arvo: '',
            vainluku: ''
        }
    });
});

app.post('/lisaa', async(req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    } else {
        try {
            if (req.body.numero && req.body.nimi) {
                const tulos = await pelivarasto.lisaa(req.body);
                res.render('tilasivu', {
                    paaotsikko: 'Lisäyksen tulos',
                    otsikko: 'Viesti',
                    viesti: tulos.viesti
                });
            } else {
                res.redirect('/lisaa');
            }
        } catch (virhe) {
            res.render('virhesivu', {
                viesti: virhe.message
            });
        }
    }
});

app.get('/paivita', (req, res) => {
    res.render('lomake', {
        paaotsikko: 'Pelin päivitys',
        otsikko: 'Syötä tiedot',
        toiminto: '/paivita',
        numero: {
            arvo: '',
            vainluku: ''
        },
        nimi: {
            arvo: '',
            vainluku: 'readonly'
        },
        arvostelu: {
            arvo: '',
            vainluku: 'readonly'
        },
        genre: {
            arvo: '',
            vainluku: 'readonly'
        },
        vuosi: {
            arvo: '',
            vainluku: 'readonly'
        }
    });
});

app.post('/paivita', async(req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    } else {
        try {
            const tulos = await pelivarasto.hae(req.body.numero);
            if (tulos.viesti) {
                res.render('tilasivu', {
                    paaotsikko: 'Hakutulos',
                    otsikko: 'Viesti',
                    viesti: tulos.viesti
                });
            } else {
                res.render('lomake', {
                    paaotsikko: 'Pelin päivitys',
                    otsikko: 'Syötä tiedot',
                    toiminto: '/paivitatiedot',
                    numero: {
                        arvo: tulos.numero,
                        vainluku: 'readonly'
                    },
                    nimi: {
                        arvo: tulos.nimi,
                        vainluku: ''
                    },
                    arvostelu: {
                        arvo: tulos.arvostelu,
                        vainluku: ''
                    },
                    genre: {
                        arvo: tulos.genre,
                        vainluku: ''
                    },
                    vuosi: {
                        arvo: tulos.vuosi,
                        vainluku: ''
                    }
                });
            }
        } catch (virhe) {
            res.render('virhesivu', {
                viesti: virhe.message
            });
        }
    }
});

app.post('/paivitatiedot', async(req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    } else {
        try {
            const tulos = await pelivarasto.paivita(req.body);
            res.render('tilasivu', {
                paaotsikko: 'Päivityksen tulos',
                otsikko: 'Viesti',
                viesti: tulos.viesti
            });
        } catch (virhe) {
            res.render('virhesivu', {
                viesti: virhe.message
            });
        }
    }
});

palvelin.listen(port, host, ()=>console.log(`Palvelin ${host} portissa ${port}.`));
