const express               = require("express");
const mongoose              = require("mongoose");
const passport              = require("passport");
const bodyParser            = require("body-parser");
const LocalStrategy         = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");

const User = require('./model/user');

const app = express();

mongoose.connect("mongodb://localhost/27017");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session") ({
    secret : "Rusty is a dog",
    resave : false,
    saveUninitialized : false
}))


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

//================================
// Routes
//================================

//Show home page
app.get("/", (req, res) => {
    res.render("home");
});

//show page after login
app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});


// show register form
app.get("/register", (req, res) => {
    res.render("register");
});

// handle user signup
app.post("/register", async (req, res) => {
    const user = await User.create({
        username : req.body.username,
        password : req.body.password 
    });
    return res.status(200).json(user);
});

//show login form
app.get("/login", (req, res) => {
    res.render("login");
})

//handle user login
app.post("/login", async (req, res) => {
    try {
        //check if the user exist
        const user = await User.findOne({username : req.body.username}); // a contant that retrieve username

        if (user) {
            //if there is a user, check if the password match
            const result = req.body.password === user.password; // a constant that compares the entered password to the user password
            if (result) {
                res.render("secret"); // if password match, show the secret landing page. the page after the authorization page
            } else {
                //if password doesnt match
                res.status(400).json({error : "password doesn't match"});
            }
        } else {
            res.status(400).json({ error : "User doesn't exist"});
        }
    }
    catch (error) {
        res.status(400).json({ error });
    }
});


//Handle user logout
app.get("/logout", (req, res) => {
    req.logout( err => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    })
})


function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server has started on port ${port}`);
})