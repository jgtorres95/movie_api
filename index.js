// import required modules
const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  Movies = Models.Movie,
  Users = Models.User,
  passport = require('passport'),
  cors = require('cors'),
{ check, validationResult } = require('express-validator'); 

// call the express function
const app = express();

// enable bodyParser
app.use(bodyParser.json());

// implement express.static
app.use(express.static('public'));

// implement morgan
app.use(morgan('common'));

// run passport file
require('./passport');

app.use(cors());

// create allowedOrigins array and enable CORS
let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234','https://jgtorres95-myflix-react.netlify.app', 'https://jgtorres95.github.io/myFlix-Angular-app/welcome'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

// implement authorization
require('./auth')(app);

/* Local database connection
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true}); */

// Online database connection
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true});

// HTTP requests

/**
 * Default endpoint
 * @method GET
 * @param {string} endpoint
 * @param {requestCallback}
 * @returns {string} welcome message
 */
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

/**
 * Return a list of ALL movies to the user
 * @method GET
 * @param {string} endpoint
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} the movies array
 */
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

/**
 * Return data about a single movie by title
 * @method GET
 * @param {string} endpoint
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} object containing data about the requested movie
 */

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


/**
 * Return data about a genre by name/title
 * @method GET
 * @param {string} endpoint
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} object containing data about the requested genre 
 */
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

/**
 * Return data about a director by name
 * @method GET
 * @param {string} endpoint
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} object containing data about the requested director
 */
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

/**
 * Return data about a user by username
 * @method GET
 * @param {string} endpoint
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} object containing data about the requested user
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOne({ Username : req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);  
    })
});

/**
 * Add a new user
 * @method POST
 * @param {string} endpoint
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} object containing data about the user that was created
 *

 * We'll expect a JSON object in this format
  {
    ID: String,
    Username: String,
    Password: String,
    Email: String,
    Birthday: String
  } 

*/
app.post('/users',
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
    
    // Check for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
}

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({Username: req.body.Username})
        .then((user) => {
            if(user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
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

/**
 * Update a user's info, by username
 * @method PUT
 * @param {string} endpoint
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} object containing data about the updated user

 * We'll expect JSON in this format:
  {
    Username: String,
    (required)
    Password: String,
    (required)
    Email: String,
    (required)
    Birhtday: String
  } 
*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false}),    
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
    
    //Validation logic for request
    let errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
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


/**
 * Add a movie to a user's list of favorites
 * @method POST
 * @param {string} endpoint
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} object containing data about the updated user 
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {$push: { FavoriteMovies: req.params.MovieID}
    },
    { new: true }, 
    (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
    });

/**
 * Remove a movie from a user's list of favorites
 * @method DELETE
 * @param {string} endpoint
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} object containing data about the updated user
 */

app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {$pull: { FavoriteMovies: req.params.MovieID}
    },
    { new: true }, 
    (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
    });

/**
 * Remove a user by username 
 * @method DELETE
 * @param {string} endpoint
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {string} message confirming successful or unsuccessful removal of user
 */

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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on port' + port);
}); 