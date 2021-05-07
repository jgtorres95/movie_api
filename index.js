const express = require('express'),
    morgan = require('morgan');

const app = express();

// Middleware functions

app.use(express.static('public'));
app.use(morgan('common'));
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something broke!');
});
