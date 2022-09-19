const express = require('express');
const router = express.Router();

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

const {
    getCategory,
    checkCategory,
    createCategory,
    updateCategory,
    removeCategory,
    restoreCategory,
    listActiveCategories,
    listCategories,
} = require('../controllers/category');

//routes
router.get('/category/by/id/:categoryId', getCategory);
router.get('/active/categories', listActiveCategories);
router.get('/categories/:userId', isAuth, isAdmin, listCategories);
router.post(
    '/category/create/:userId',
    isAuth,
    isAdmin,
    checkCategory,
    createCategory,
);
router.put(
    '/category/:categoryId/:userId',
    isAuth,
    isAdmin,
    checkCategory,
    updateCategory,
);
router.delete('/category/:categoryId/:userId', isAuth, isAdmin, removeCategory);
router.get(
    '/category/restore/:categoryId/:userId',
    isAuth,
    isAdmin,
    restoreCategory,
);

//router params
router.param('userId', userById);

module.exports = router;
