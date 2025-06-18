const express = require('express');
const productController = require("../controllers/product.js");
const { verify, verifyAdmin } = require('../auth.js'); 

const router = express.Router();


//Admin only routes
router.post("/", verify, verifyAdmin, productController.addProduct);
router.get("/all", verify, verifyAdmin, productController.getAllProducts);
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);
router.patch("/:productId/archive",verify, verifyAdmin, productController.archiveProduct);
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);


//users routes
router.get("/active", productController.getAllActive);
router.get("/:id",productController.getProduct); 
router.post('/search-by-name', productController.searchByName);
router.post('/search-by-price', productController.searchByPriceRange);




module.exports = router;