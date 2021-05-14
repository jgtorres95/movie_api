const express = require('express'),
    morgan = require('morgan');

const app = express();

// Middleware functions
app.use(express.static('public'));
app.use(morgan('common'));

// Declare topMovies 
let topMovies = [
    {
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        year: '1994'
    },
    {
        title: 'Inception',
        director: 'Christopher Nolan',
        year: '2010'
    },
    {
        title: 'The Dark Knight',
        director: 'Christopher Nolan',
        year: '2008'
    },
    {
        title: 'Avengers: Infinity War',
        director: 'Anthony Russo, Joe Russo',
        year: '2018'
    },
    {
        title: 'The Wolf of Wall Street',
        director: 'Martin Scorsese',
        year: '2013'
    },
    {
        title: 'Pulp Fiction',
        director: 'Quentin Tarantino',
        year: '1963'
    },
    {
        title: 'Fight Club',
        director: 'David Fincher',
        year: '1999'
    },
    {
        title: 'Parasite',
        director: 'Bong Joon Ho',
        year: '2019'
    },
    {
        title: 'The Lion King',
        director: 'Roger Allers, Rob Minkoff',
        year: '1994'
    },
    {
        title: 'Alien',
        director: 'Ridley Scott',
        year: '1979'
    }
];

// HTTP requests

app.get('/movies', (req, res) => {
    res.send('Successful GET request returning data on all movies');
});

app.get('/movies/:title', (req, res) => {
    res.send('Successful GET request returning data on the movie');
});

app.get('/movies/genres/:genre', (req, res) => {
    res.send('Successful GET request returning data on genre');
});

app.get('/movies/directors/:name', (req,res) => {
    res.send('Successful GET request returning data on the director');
});

app.post('/users/register', (req,res) => {
    res.send('Successful POST request returning data on the user that was registered');
});

app.put('/users/:username', (req, res) => {
    res.send('Successful PUT request returning success message');
});

app.post('/users/:username/favorites/:movie', (req, res) => {
    res.send('Successful POST request returing a success message');
});

app.delete('/users/:username/favorites/:movie', (req, res) => {
    res.send('Successful DELETE request returning a success message');
});

app.delete('/users/register/:username', (req, res) => {
    res.send('Successful DELETE request returning a success message');
});

// Error-handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});