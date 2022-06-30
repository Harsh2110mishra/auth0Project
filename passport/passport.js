require("dotenv").config();
const passport = require("passport");
const User = require("../model/user");

var GoogleStrategy = require("passport-google-oauth20").Strategy;

// here it will create a user with token in it
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// fetch the user details from the existing user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, next) => {
      console.log("MY PROFILE", profile._json.email);
      User.findOne({ email: profile._json.email }).then((user) => {
        if (user) {
          console.log("User already exits in DB", user);
          next(null, user);
          // cookietoken() if we used it like in other projects
        } else {
          User.create({
            name: profile.displayName,
            googleId: profile.id,
            email: profile._json.email,
          })
            .then((user) => {
              console.log("New User", user);
              next(null, user);
              // cookietoken() if we used it like in other projects
            })
            .catch((err) => console.log(err));
        }
      });
    }
  )
);
