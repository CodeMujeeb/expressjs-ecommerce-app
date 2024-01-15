const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'Shop',
            path: '/products',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true
        });
    });
}

exports.getProduct = (req, res, next) => {
    Product.findById(req.params.id, product => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
            activeShop: true,
            productCSS: true
        });
    });
}

exports.addToCart = (req, res, next) => {
    const productId = req.body.prodId;
    res.redirect('/cart')
}