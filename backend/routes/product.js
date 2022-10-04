const express = require('express');
const router = express.Router();

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { checkCategoryChild } = require('../controllers/category');
const { upload } = require('../controllers/upload');
const {
    productById,
    getProduct,
    createProduct,
    updateProduct,
    sellingProduct,
    activeProduct,
    addToListImages,
    updateListImages,
    removefromListImages,
    listProducts,
    listProductsForAdmin,
    listProductCategories,
} = require('../controllers/product');

//routes
router.get('/product/:productId', getProduct);

router.get('/active/products', listProductCategories, listProducts);

router.get('/products/:userId', isAuth, isAdmin, listProductsForAdmin);
router.post(
    '/product/create/:userId',
    isAuth,
    isAdmin,
    upload,
    checkCategoryChild,
    createProduct,
);

router.put(
    '/product/update/:productId/:userId',
    isAuth,
    isAdmin,
    upload,
    checkCategoryChild,
    updateProduct,
);

router.put(
    '/product/active/:productId/:userId',
    isAuth,
    isAdmin,
    activeProduct,
);
router.post(
    '/product/images/:productId/:userId',
    isAuth,
    isAdmin,
    upload,
    addToListImages,
);
router.put(
    '/product/images/:productId/:userId',
    isAuth,
    upload,
    updateListImages,
);
router.delete(
    '/product/images/:productId/:userId',
    isAuth,
    removefromListImages,
);

//router params
router.param('productId', productById);
router.param('userId', userById);


module.exports = router;
