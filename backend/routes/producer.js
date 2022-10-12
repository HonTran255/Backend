const express = require('express');
const router = express.Router();

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const {
    producerById,
    getproducer,
    createproducer,
    updateproducer,
    removeproducer,
    listActiveProducers,
    listProducers,
} = require('../controllers/producer');

//routes
router.get('/producer/by/id/:producerId', getproducer);
router.get('/active/producers', listActiveProducers);
router.get('/producers/:userId', isAuth, isAdmin, listProducers);
router.post(
    '/producer/create/:userId',
    isAuth,
    createproducer,
);
router.put(
    '/producer/:producerId/:userId',
    isAuth,
    isAdmin,
    updateproducer,
);
router.delete('/producer/:producerId/:userId', isAuth, isAdmin, removeproducer);

//router params
router.param('producerId', producerById);
router.param('userId', userById);

module.exports = router;
