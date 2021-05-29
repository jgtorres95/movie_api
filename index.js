const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    Models = require('./models.js'); 

const Movies = Models.Movie;
const Users = Models.User;
const app = express();

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true}); 

// Middleware functions
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('common'));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

// HTTP requests

// Return a list of ALL movies to the user
app.get('/movies', passport.authenticate('jwt', { session: false}), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err); 
        }); 
});

// Return data about a single movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false}), (req, res) => {
    Movies.findOne({ Title: req.params.Title})
        .then((movie) => {
            res.json(movie); 
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        }); 
});

// Return data about a genre by name/title
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false}), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name})
        .then((movie) => {
            res.json(movie.Genre);
        })
        .catch((err) => {
            console.error(err); 
            res.status(500).send('Error: ' + err); 
        })
});

// Return data about a director by name
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false}), (req,res) => {
    Movies.findOne({ 'Director.Name': req.params.Name})
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err); 
            res.status(500).send('Error: ' + err); 
        })
});

//Add a user
/* We'll expect JSON in this format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
} */
app.post('/users', (req, res) => {
    Users.findOne({Username: req.body.Username})
        .then((user) => {
            if(user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {res.status(201).json(user)})
                    .catch((err) => {
                        console.error(err);
                        res.status(500).send('Error: ' + err);
                    })
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Update a user's info, by username
/* We'll expect JSON in this format:
{
    Username: String,
    (required)
    Password: String,
    (required)
    Email: String,
    (required)
    Birhtday: Date
} */

app.put('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true },
    (err, updatedUser) => {
        if(err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
    });

 // Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {$push: { FavoriteMovies: req.params.MovieID}
    },
    { new: true }, //This lines make sure that the updated document is returned
    (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
    });

// Remove a movie from a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {$pull: { FavoriteMovies: req.params.MovieID}
    },
    { new: true }, //This lines make sure that the updated document is returned
    (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
    });

// Remove a user by username 
app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username })
        .then((user) => {
            if(!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted'); 
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err); 
        });
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