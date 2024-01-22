const fs = require('fs')

const Product = require('../models/product');
const Order = require('../models/order');
const path = require('path');
const ITEMS_PER_PAGE = 10;

exports.getProducts = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
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
  const page = parseInt(req.query.page) || 1;
  let totalItems;

  Product.count().then(numProducts => {
    totalItems = numProducts
    return Product.findAll({ limit: ITEMS_PER_PAGE, offset: (page - 1) * ITEMS_PER_PAGE })
  })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        pagination: {
          currentPage: page,
          previousPage: page - 1,
          totalProducts: totalItems,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        }
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user.getCart().then(cart => {
    if (!cart) {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: []
      });
    }
    return cart.getProducts()
  }).then(products => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let product;
  let newQuantity = 1;
  req.user.getCart().then(userCart => {
    if (!userCart) {
      return req.user.createCart()
    }
    return userCart;
  })
    .then(cart => {
      fetchedCart = cart
      return cart.getProducts({ where: { id: prodId } })
    })
    .then(products => {
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
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
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
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
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  })
}

exports.downloadInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'Invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName)
  let userOrder;
  Order.findOne({ where: { id: orderId } })
    .then(order => {
      if (!order) {
        return next(new Error('No Order Found'))
      }
      userOrder = order
      return order.getUser();
    })
    .then(user => {
      if (req.user.id.toString() !== user.id.toString()) {
        return next(new Error('Unauthorized access'))
      }
      const file = fs.createReadStream(invoicePath)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=Ecommerce Shop - ${invoiceName}`);
      file.pipe(res)
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    })
}