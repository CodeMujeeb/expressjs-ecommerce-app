const path = require('path');

const express = require('express');

const productController = require('../controllers/products');

const router = express.Router();

router.get('/products', productController.getProducts);

router.post('/products/:id/delete', productController.getProduct);

router.post('/cart', productController.addToCart);

router.get('/products/:id', productController.getProduct);

module.exports = router;
