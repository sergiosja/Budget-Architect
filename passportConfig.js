// The login system
const LocalStrategy = require('passport-local').Strategy;
const {pool} = require('./dbConfig');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { authenticate } = require('passport');

// Avoids the usual confusion with logins, this function specifies whether 
// the password does not match or the user is not found in the database
function initialize(passport) {
    const authenticateUser = (username, password, done) => {
        pool.query(
            `select * from users where name = $1`, [username], (err, results) => {
                if (err) {
                    throw err;
                }

                // If the query has any results, that means the username exists in the database
                if (results.rows.length > 0) {
                    const user = results.rows[0];

                    // Comparing the passwords
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            throw err;
                        }

                        // If they are a match, user is awarded access to the main menu
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, {message: 'Incorrect password'});
                        }
                    });

                // If results.rows.length is 0
                } else {
                    return done(null, false, {message: 'User not registered'});
                }
            }
        );
    }

    passport.use(
        new LocalStrategy ({
            usernameField: 'username',
            passwordField: 'password'
        },
        authenticateUser
        )
    ); 

    // Serialising user for session
    passport.serializeUser((user, done) => done(null, user.userid));

    // Deserialising user after end of session
    passport.deserializeUser((userid, done) => {
        pool.query(
            `select * from users where userid = $1`, [userid], (err, results) => {
                if (err) {
                    throw err;
                }

                return done(null, results.rows[0]);
            }
        );
    });
}

module.exports = initialize;