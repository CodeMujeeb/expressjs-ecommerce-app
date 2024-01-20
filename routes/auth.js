const express = require('express');
const { check, body, custom } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
    [
        check('email').isEmail().withMessage('Please enter valid E-mail').normalizeEmail(),
        body('password', 'Password must have 5 alphanumeric characters')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin);

router.post('/signup',
    [
        body('name', 'Name must have 5 characters').isLength({ min: 5 }).trim(),
        check('email')
            .isEmail()
            .withMessage('Please enter valid email')
            .custom((value, { req }) => {
                return User.findOne({ where: { email: value } })
                    .then(user => {
                        if (user) {
                            return Promise.reject(
                                'E-Mail exists already, please pick a different one.'
                            );
                        }
                        return true;
                    })
            }).normalizeEmail(),
        body('password', 'Password must have 5 alphanumeric characters')
            .isLength({ min: 5 })
            .isAlphanumeric().trim(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password must be match')
            }
            return true;
        })
    ],
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/set-password', authController.getPasswordForm);

router.post('/set-password', authController.setPassword);

module.exports = router;