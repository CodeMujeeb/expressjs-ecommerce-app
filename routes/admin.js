const path = require('path');

const express = require('express');

const productController = require('../controllers/admin/products');

const router = express.Router();

// /admin/add-product => GET
router.get('/products', productController.getProducts);
router.get('/add-product', productController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', productController.postAddProduct);

exports.routes = router;
