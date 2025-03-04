// index.js
const express = require('express');
const jwt = require('jsonwebtoken'); // Importa jsonwebtoken
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    return res.status(401).send('No autorizado: Token faltante');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Error verificando token:', err);
      return res.status(401).send('No autorizado: Token inválido');
    }
    req.user = decoded; // Guarda el payload del token (por ejemplo, id, email, rol)
    next();
  });
  
};

// Endpoint para login: autentica al usuario y genera un token JWT
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca al usuario en la base de datos
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Aquí deberías comparar la contraseña usando bcrypt si están hasheadas.
    // Para este ejemplo, asumimos que se comparan en texto plano.
    if (password !== user.password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crea el payload con los datos del usuario
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Firma el token con una expiración (por ejemplo, 1 hora)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta protegida: solo se accede si el token JWT es válido
app.get('/api/ordenes', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ordenes');
    res.json(result.rows);
  } catch (error) {
    console.error('Error consultando ordenes:', error);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta protegida de ejemplo para meseros (completa según tu lógica)
app.get('/api/meseros', verifyToken, async (req, res) => {
  try {
    // Ajusta la consulta SQL según lo que necesites
    const result = await db.query('SELECT * FROM meseros');
    res.json(result.rows);
  } catch (error) {
    console.error('Error consultando meseros:', error);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta pública
app.get('/api/publico', (req, res) => {
  res.send('Esta es una ruta pública');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
