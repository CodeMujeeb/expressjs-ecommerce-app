const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const AuthMiddleware = require('../middleware/auth')

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', AuthMiddleware, shopController.getCart);

router.post('/cart', AuthMiddleware, shopController.postCart);

router.post('/cart-delete-item', AuthMiddleware, shopController.postCartDeleteProduct);

router.post('/create-order', AuthMiddleware, shopController.postOrder);

router.get('/orders', AuthMiddleware, shopController.getOrders);

router.get('/orders/:orderId/invoice', AuthMiddleware, shopController.downloadInvoice);

module.exports = router;
