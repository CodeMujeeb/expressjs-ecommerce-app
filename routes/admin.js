const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

const AuthMiddleware = require('../middleware/auth')

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', AuthMiddleware, adminController.postAddProduct);

router.get('/edit-product/:productId', AuthMiddleware, adminController.getEditProduct);

router.post('/edit-product', AuthMiddleware, adminController.postEditProduct);

router.post('/delete-product', AuthMiddleware, adminController.postDeleteProduct);

module.exports = router;
