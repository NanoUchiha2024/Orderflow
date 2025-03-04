const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split('Bearer ')[1];

    if (!token){
        return res.status(401).send('No autorizado: Token faltante');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

        if (err) {     
            console.error('Error verificando token:', err);
            return res.status(401).send('No autorizado: Token invalido');

        }
        req.user = decoded;
        next()
    });
};


app.get('/api/ordenes', verifyToken, async (req, res) => {

    try {
        const result = await db.query('SELECT * FROM ordenes');
        res.json(result.rows);
    }catch(error){
        console.error('Error consultando ordenes:', error);
        res.status(500).send('Error en el servidor');
    }

});


app.get('/api/meseros', verifyToken, async(req, res) => {

    try {
       const result = await db.query('SELECT ')
    } catch (error) {
        
    }
    
});


app.get('/api/publico', (req, res) => {
    res.send('Esta es una ruta publica');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});




