const express = require('express');
const routes = require('./routes');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/auth', routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});

