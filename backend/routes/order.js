const express = require('express');
const router = express.Router();

//controllers
const { isAuth, isAdmin, isManager } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { cartById } = require('../controllers/cart');
const {
    createTransaction,
} = require('../controllers/transaction');
const {
    orderById,
    createOrder,
    createOrderItems,
    removeCart,
    removeAllCartItems,
    listOrderForAdmin,
    listOrderByUser,
    checkOrderAuth,
    readOrder,
    updateStatusForUser,
    updateStatusForAdmin,
    updateQuantitySoldProduct,
    countOrders,
    listOrderItems,

} = require('../controllers/order');

//routes
router.get('/orders/count', countOrders);
router.get(
    '/order/items/by/user/:orderId/:userId',
    isAuth,
    checkOrderAuth,
    listOrderItems,
);
router.get(
    '/order/items/by/:orderId/:userId',
    isAuth,
    checkOrderAuth,
    listOrderItems,
);
router.get(
    '/order/items/for/admin/:orderId/:userId',
    isAuth,
    isAdmin,
    checkOrderAuth,
    listOrderItems,
);
router.get(
    '/order/by/user/:orderId/:userId',
    isAuth,
    checkOrderAuth,
    readOrder,
);
router.get(
    '/order/by/:orderId/:userId',
    isAuth,
    checkOrderAuth,
    readOrder,
);
router.get(
    '/order/for/admin/:orderId/:userId',
    isAuth,
    isAdmin,
    checkOrderAuth,
    readOrder,
);
router.get('/orders/by/user/:userId', isAuth, listOrderByUser);
router.get('/orders/for/admin/:userId', isAuth, isAdmin, listOrderForAdmin);
router.post(
    '/order/create/:cartId/:userId',
    isAuth,
    createOrder,
    createOrderItems,
    removeCart,
    removeAllCartItems,
);
router.put(
    '/order/update/by/user/:orderId/:userId',
    isAuth,
    checkOrderAuth,
    updateStatusForUser,
    createTransaction,
);
router.put(
    '/order/update/by/:orderId/:userId',
    isAuth,
    checkOrderAuth,
    createTransaction,
);
router.put(
    '/order/update/for/admin/:orderId/:userId',
    isAuth,
    isAdmin,
    checkOrderAuth,
    updateStatusForAdmin,
    createTransaction,
    updateQuantitySoldProduct,
);

//params
router.param('orderId', orderById);
router.param('cartId', cartById);
router.param('userId', userById);

module.exports = router;
