const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.js");
const { verify, verifyAdmin } = require("../auth.js");


router.post('/checkout', verify , orderController.checkOut);

router.get('/my-orders',  verify ,  orderController.myOrders);

router.get('/all-orders', verify , verifyAdmin, orderController.allOrders);


module.exports = router;
