const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
require('dotenv').config()

const router = Router();

router.post('/register', async (req, res) => {

    const { nombre, correo, telefono, contrasena, rol} = req.body;

    if (!correo || !contrasena){
        return res.status(400).json({ error: 'Faltan campos requeridos: email o password' });
    }

    try {

      const userCheck = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
      if (userCheck.rows.length > 0){
         return res.status(400).json({ error: 'El usuario ya existe' });
      }

      const hasdPassword = await bcrypt.hash(contrasena, 10);
      
      const insertQuery = `
       INSERT INTO usuarios (nombre, correo, telefono, contrasena, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre, correo, telefono, rol
      `;

      const { rows } = await db.query(insertQuery, [
        nombre,
        correo,
        telefono,
        hasdPassword,
        rol
      ]);

      const newUser = rows[0];

      return res.status(201).json({
        message: 'Usuario registrado con exito',
        user: newUser
      });
    } catch (error){
      console.error('Error en el registro', error);
      return res.status(500).json( { error: 'Error en el servidor'} );
    }
});


router.post('/login', async (req, res) => {

  const { credential, password} = req.body;

  if (!credential || !password){
    return res.status(400).json({ error: 'Faltan campos requeridos.'});
  }

  try{

    const result = await db.query(
      'SELECT * FROM usuarios WHERE correo = $1 OR telefono = $1',
      [credential]
    );

    if (result.rows.length === 0){
      return res.status(401).json({ error: 'Credenciales Invalidas' });
    }

    const user = result.rows[0];
    
    const isMatch = await bcrypt.compare(password, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
       id: user.id_usuario,
       nombre: user.nombre,
       correo: user.correo,
       telefono: user.telefono,
       rol: user.rol
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h'});

    return res.json({ token });

  }catch(error){
    console.error('Error en el login', error)
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});


router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split('Bearer ')[1];

  if (!token){
    return res.status(401).json({ error: 'Token Faltante'});     
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalido' });
    }
    return res.json({ message: 'Token valido', decoded});
  });

});

module.exports = router
