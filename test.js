const db = require('./database/db'); // Ajusta la ruta según tu estructura

db.query('SELECT 1', [])
  .then((result) => {
    console.log('Conexión exitosa. Resultado:', result.rows);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error conectando a la base de datos:', error);
    process.exit(1);
  });
