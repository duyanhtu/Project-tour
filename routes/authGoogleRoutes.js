const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('./../controllers/authController');

router
    .route('/')
    .get(passport.authenticate('google', {
            scope: ['email', 'profile']
        })
    )

router
    .route('/callback')
    .get(passport.authenticate('google',{
            successRedirect: '/protected',
            failureRedirect: '/failure',
        })
    )


module.exports = router;