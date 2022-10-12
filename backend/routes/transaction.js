const express = require('express');
const router = express.Router();

//controllers
const {
    isAuth,
    isAdmin,
    verifyPassword,
} = require('../controllers/auth');
const { userById, getUserProfile } = require('../controllers/user');
const {
    requestTransaction,
    createTransaction,
    listTransactions,
} = require('../controllers/transaction');

//routes
router.get('/transactions/by/user/:userId', isAuth, listTransactions);
router.get(
    '/transactions/by/:userId',
    isAuth,
    listTransactions,
);
router.get(
    '/transactions/for/admin/:userId',
    isAuth,
    isAdmin,
    listTransactions,
);
router.post(
    '/transaction/create/by/user/:userId',
    isAuth,
    verifyPassword,
    requestTransaction,
    createTransaction,
    getUserProfile,
);
router.post(
    '/transaction/create/by/:userId',
    isAuth,
    verifyPassword,
    requestTransaction,
    createTransaction,
);
router.post(
    '/transaction/create/for/admin/:userId',
    isAuth,
    verifyPassword,
    isAdmin,
    requestTransaction,
    createTransaction,
);

//params

router.param('userId', userById);

module.exports = router;
