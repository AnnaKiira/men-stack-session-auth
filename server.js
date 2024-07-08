//Imports
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const authController = require('./controllers/auth.js');
const session = require('express-session');
const MongoStore = require('connect-mongo'); 


//Constants
const app = express();
const port = process.env.PORT || 3000

//Middleware
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride('_method'));
// Morgan for logging HTTP requests
app.use(morgan('dev'));
//Setting the View Engine, ejs
app.set('view engine', 'ejs');
// Express Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI
  })
}));


//Routes
//this is our landing page route
app.get("/", async (req, res) => {
    res.render('index', {
        user: req.session.user
    });
});

//Auth
app.use('/auth', authController)


app.get('/vip-lounge', (req, res) => {
    if (req.session.user) {
        res.send(`Welcome to the party ${req.session.user.username}.`)
    } else {
        res.redirect('/auth/sign-in')
    }
})

//Connections
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database Connection Established')
        app.listen(port, () => {
            console.log(`The express app is ready on port ${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}

connect()
