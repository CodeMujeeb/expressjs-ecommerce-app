const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(
  path.dirname(require.main.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(productsFilePath, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(title, imageUrl, price, description = '') {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }

  save() {
    this.id = Math.floor(Math.random() * 101);

    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(productsFilePath, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id)
      cb(product)
    });
  }
};