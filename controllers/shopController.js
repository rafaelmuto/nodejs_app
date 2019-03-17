// importing models:
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");

// here we exports all shop routes functions:

exports.getIndex = (req, res, nxt) => {
  productModel
    .findAll()
    .then(products => {
      res.render("shop/index", {
        pageTitle: "Shop",
        path: "/",
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, nxt) => {
  productModel
    .findAll()
    .then(products => {
      res.render("shop/product-list", {
        pageTitle: "Shop",
        path: "/products",
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, nxt) => {
  const prodId = req.params.productId;

  // productModel.findAll({
  //         where: {
  //             id: prodId
  //         }
  //     })
  //     .then(products => {
  //         res.render('shop/product-detail', {
  //             pageTitle: products[0].title,
  //             path: '/products',
  //             product: products[0]
  //         });
  //     })
  //     .catch(err => console.log(err));

  // same as above, but with findByPk() instead of findAll(...):
  productModel
    .findByPk(prodId)
    .then(product => {
      res.render("shop/product-detail", {
        pageTitle: product.title,
        path: "/products",
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, nxt) => {
  req.user
    .getCart()
    .then(cart => {
      return cart
        .getProducts()
        .then(products => {
          res.render("shop/cart", {
            pageTitle: "Your Cart",
            path: "/cart",
            products: products
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, nxt) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuant = 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuant = product.cartitem.quantity;
        newQuant = oldQuant + 1;
        return product;
      }
      return productModel.findByPk(prodId);
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuant }
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, nxt) => {
  const prodId = req.body.productId;
  console.log(prodId);
  productModel.findById(prodId, product => {
    console.log(product);
    cartModel.deleteProduct(prodId, product.price);
    res.redirect("/cart");
  });
};

exports.getCheckout = (req, res, nxt) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout"
  });
};

exports.getOrders = (req, res, nxt) => {
  res.render("shop/orders", {
    pageTitle: "Your Orders",
    path: "/orders"
  });
};
