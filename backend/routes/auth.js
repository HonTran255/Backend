const express = require('express');
const router = express.Router();

//import validators
const authValidator = require('../validators/auth');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const {
    signup,
    signin,
    forgotPassword,
    changePassword,
    isAuth,
    refreshToken,
    signout,
    authSocial,
    createToken,
    authUpdate,
} = require('../controllers/auth');
const { userById } = require('../controllers/user');
const {
    sendChangePasswordEmail,
    verifyEmail,
} = require('../controllers/email');


//routes
router.post('/signup', authValidator.signup(), validateHandler, signup);
router.post(
    '/signin',
    authValidator.signin(),
    validateHandler,
    signin,
    createToken,
);
router.post(
    '/auth/social',
    authValidator.authSocial(),
    validateHandler,
    authSocial,
    authUpdate,
    createToken,
);
router.post('/signout', signout);
router.post('/refresh/token', refreshToken);
router.post(
    '/forgot/password',
    authValidator.forgotPassword(),
    validateHandler,
    forgotPassword,
    sendChangePasswordEmail,
);
router.put(
    '/change/password/:forgotPasswordCode',
    authValidator.changePassword(),
    validateHandler,
    changePassword,
);
router.get('/verify/email/:emailCode', verifyEmail);

router.param('userId', userById);

module.exports = router;
