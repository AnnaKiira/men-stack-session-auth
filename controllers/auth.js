const express = require("express");
const router = express.Router();
const User = require('../models/user.js');
const bcrypt = require("bcryptjs");


//Routes / Controllers
//All routes here are already prefixed with /auth
//GET /auth/sign-up
router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up');
});

router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in');
});

router.post('/sign-up', async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username }); //Check if a username already exists in the database. If so, send a message saying "Username already taken"
    if (userInDatabase) {
        return res.send('Username already taken.');
    }
    if (req.body.password !== req.body.confirmPassword) { //Checks if password and confirm password fields match. If not, message is displayed "Passwords do not match."
        return res.send('Passwords do not match');
    }
    req.body.password = bcrypt.hashSync(req.body.password, 12);
    const user = await User.create(req.body);
    return res.send(`Thanks for signing up ${user.username}`);

});


router.post("/sign-in", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
        return res.send("Login failed. Please try again.");
    }
    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password);
    if (!validPassword) {
        return res.send("Login failed. Please try again.");
    }

    req.session.user = {
        username: userInDatabase.username
    }
    req.session.save(() => { 
        res.redirect('/')
    });
});


//Sign out
router.get('/sign-out', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});



module.exports = router;