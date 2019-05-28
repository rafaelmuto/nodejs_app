// importing Product model:
const productModel = require("../models/productModel");

// here we exports all admin routes functions:

// you can use module.exports or just exports...
exports.getAddProduct = (req, res, nxt) => {
  console.log("==> adminController: getAddProduct");
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    // pug doesnt care about having or not the edit: false here:
    edit: false
  });
};

exports.postAddProduct = (req, res, nxt) => {
  console.log("==> adminController: postAddProduct");
  console.log("-> adding product:", req.body);
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new productModel({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    // mongoose will automatically get the _id from the userModel Obj:
    userId: req.user
  });

  product
    .save()
    .then(result => {
      // console.log(result);
      console.log("-> new product added");
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, nxt) => {
  console.log("==> adminController: getEditProduct");
  const editMode = req.query.edit;
  if (!editMode) {
    console.log("-> acesses denied: editMode == FALSE");
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  productModel
    .findById(prodId)
    .then(product => {
      if (!product) {
        console.log("-> no such product found");
        res.redirect("/");
      }
      console.log("-> product updated:", product);
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/edit-product",
        edit: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, nxt) => {
  console.log("==> adminController: postEditProduct");
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;

  productModel
    .findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        console.log("-> wrong userId...");
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;

      console.log("-> diplaying product:", product);
      return product.save().then(result => {
        res.redirect("/admin/products");
      });
    })
    .catch(err => console.log(err));
};

exports.getAdminProducts = (req, res, nxt) => {
  console.log("==> adminController: getAdminProducts");
  productModel
    .find({ userId: req.user._id })
    // .populate("userId")
    .then(products => {
      // console.log("-> products list:", products);
      res.render("admin/products-list", {
        pageTitle: "Admin Products",
        path: "/admin/products",
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, nxt) => {
  console.log("==> adminController: postDeleteProduct");
  const prodId = req.body.productId;
  productModel
    .deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log("-> product deleted:", prodId);
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};
