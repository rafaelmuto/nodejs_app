// importing models:
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");

// here we exports all shop routes functions:

exports.getIndex = (req, res, nxt) => {
  console.log("==> shopController: getIndex");
  productModel
    .find()
    .then(products => {
      // console.log("-> products list:", products);
      res.render("shop/index", {
        pageTitle: "Shop",
        path: "/",
        products: products,
        isAuth: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, nxt) => {
  console.log("==> shopController: getProducts");
  productModel
    .find()
    .then(products => {
      // console.log("-> products list:", products);
      res.render("shop/product-list", {
        pageTitle: "Shop",
        path: "/products",
        products: products,
        isAuth: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, nxt) => {
  console.log("==> shopController: getProduct");
  const prodId = req.params.productId;
  productModel
    .findById(prodId)
    .then(product => {
      // console.log("-> product:", product);
      res.render("shop/product-detail", {
        pageTitle: product.title,
        path: "/products",
        product: product,
        isAuth: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, nxt) => {
  console.log("==> shopController: getCart");
  req.session.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      // console.log("-> cart product list");
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products,
        isAuth: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, nxt) => {
  console.log("==> shopController: postCart");
  const prodId = req.body.productId;
  productModel
    .findById(prodId)
    .then(product => {
      req.session.user.addToCart(product);
      res.redirect("/cart");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, nxt) => {
  console.log("==> shopController: postCartDeleteProduct");
  const prodId = req.body.productId;
  console.log("-> removing product:", prodId);
  req.session.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, nxt) => {
  req.session.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { qnt: i.qnt, productData: { ...i.productId._doc } };
      });
      const order = new orderModel({
        user: {
          name: req.session.user.name,
          userId: req.session.user
        },
        products: products
      });
      return order.save();
    })
    .then(() => {
      req.session.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, nxt) => {
  orderModel
    .find({ "user.userId": req.session.user._id })
    .then(orders => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
        isAuth: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, nxt) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
    isAuth: req.session.isLoggedIn
  });
};
