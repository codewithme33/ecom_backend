const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.js');   
const { verify } = require('../auth.js');   


router.get('/get-cart', verify, cartController.getCart);

router.post('/add-to-cart', verify, cartController.addToCart);

router.patch('/update-cart-quantity', verify, cartController.updateCartQuantity);

router.patch('/:productId/remove-from-cart', verify,  cartController.removeFromCart);

router.put('/clear-cart', verify, cartController.clearCart);

module.exports = router;
