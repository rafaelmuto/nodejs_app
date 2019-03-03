// importing models:
const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');

// here we exports all shop routes functions:

exports.getIndex = (req, res, nxt) => {
    productModel.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('shop/index', {
                pageTitle: 'Shop',
                path: '/',
                products: rows
            });
        })
        .catch(err => console.log(err));
};

exports.getProducts = (req, res, nxt) => {
    productModel.fetchAll()
        .then(([rows, fielData]) => {
            res.render('shop/product-list', {
                pageTitle: 'Shop',
                path: '/products',
                products: rows
            });
        })
        .catch(err => console.log(err));
};

exports.getProduct = (req, res, nxt) => {
    const prodId = req.params.productId;
    productModel.findById(prodId)
        .then(([product]) => {
            res.render('shop/product-detail', {
                pageTitle: product.title,
                path: '/products',
                product: product[0]
            });
        })
        .catch(err => console.log(err));
};

exports.getCart = (req, res, nxt) => {
    cartModel.getCart(cart => {
        productModel.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id == product.id);
                if (cartProductData) {
                    cartProducts.push({
                        productData: product,
                        qty: cartProductData.qty
                    });
                }
            }
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            });
        });
    });
};

exports.postCart = (req, res, nxt) => {
    const prodId = req.body.productId;
    productModel.findById(prodId, (product) => {
        cartModel.addProduct(prodId, product.price);
    })
    res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, nxt) => {
    const prodId = req.body.productId;
    console.log(prodId);
    productModel.findById(prodId, product => {
        console.log(product);
        cartModel.deleteProduct(prodId, product.price);
        res.redirect('/cart');
    });
}

exports.getCheckout = (req, res, nxt) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};

exports.getOrders = (req, res, nxt) => {
    res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    })
}