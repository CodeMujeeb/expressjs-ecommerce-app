const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(error => {
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId).then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(error => {
  });
};

exports.getCart = (req, res, next) => {
  req.user.getCart().then(cart => {
    return cart.getProducts()
  }).then(products => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  }).catch(err => {

  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  console.log('USER', req.user)
  let fetchedCart;
  let product;
  let newQuantity = 1;

  req.user.getCart().then(cart => {
    fetchedCart = cart
    return cart.getProducts({ where: { id: prodId } })
  }).then(products => {
    if (products.length > 0) {
      product = products[0];
    }
    if (product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      return product;
    }
    return Product.findByPk(prodId)
  })
    .then(product => {
      return fetchedCart.addProduct(product, { through: { quantity: newQuantity } })
    })
    .then(cart => {
      res.redirect('/cart');
    }).catch(err => {

    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart().then(cart => {
    return cart.getProducts({ where: { id: prodId } })
  }).then(products => {
    let product;
    product = products[0]
    return product.cartItem.destroy();
  }).then(cartItem => {
    res.redirect('/cart');
  })
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders({ include: ['products'] }).then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  })
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  let cartProducts;
  req.user.getCart().then(cart => {
    fetchedCart = cart
    return cart.getProducts()
  }).then(products => {
    cartProducts = products
    console.log(products);
    return req.user.createOrder().then(order => {
      return order.addProducts(cartProducts.map(
        product => {
          product.orderItem = { quantity: product.cartItem.quantity }
          return product
        }
      ))
    }).catch(err => console.log(err))
  }).then(result => {
    return fetchedCart.setProducts(null)
  }).then(result => {
    res.redirect('/orders')
  }).catch(err => console.log(err))
}