// the cart model
const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
const bcrypt = require("bcrypt");
const {errorHandler} = require("../auth.js");

// Retrive Users Cart
module.exports.getCart = (req, res) => {
    return Cart.findOne({userId: req.user.id })
    .then((cart) => res.status(200).send({ cart }))
    .catch(err => res.status(500).send({ error: 'Internal Server Error' }))

}

// Add product to cart
module.exports.addToCart = async (req, res) => {
    try {
        // Check if req.user is defined
        if (!req.user || !req.user.id) {
            return res.status(400).send({ message: 'User is not authenticated.' });
        }

        const userId = req.user.id;
        const { productId, price, quantity } = req.body;

        // Debugging log for userId and other variables
        console.log("Adding to cart:", { userId, productId, price, quantity });

        // Check if price, quantity, and productId are provided
        if (!productId || !price || !quantity) {
            return res.status(400).send({ message: 'Product ID, price, and quantity are required.' });
        }

        // Ensure price and quantity are valid numbers
        if (typeof price !== 'number' || isNaN(price) || price <= 0) {
            return res.status(400).send({ message: 'Price must be a valid positive number.' });
        }
        if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
            return res.status(400).send({ message: 'Quantity must be a valid positive number.' });
        }

        // Calculate subtotal
        let subtotal = price * quantity;

        // Ensure subtotal is a valid number
        if (isNaN(subtotal) || subtotal <= 0) {
            return res.status(400).send({ message: 'Calculated subtotal is invalid.' });
        }

        // Check if the product exists in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ message: 'Product not found.' });
        }

        // Check if the user already has a cart
        let cart = await Cart.findOne({ userId: userId });

        if (cart) {
            // Check if the product is already in the cart
            const existingProductIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId.toString());

            if (existingProductIndex !== -1) {
                // If the product exists, update the quantity and subtotal
                cart.cartItems[existingProductIndex].quantity += quantity;
                cart.cartItems[existingProductIndex].subtotal += subtotal;
            } else {
                // Add the new product to the cart
                cart.cartItems.push({ productId, quantity, subtotal });
            }
        } else {
            // If the user doesn't have a cart, create one
            cart = new Cart({
                userId: userId,
                cartItems: [{ productId, quantity, subtotal }],
                totalPrice: subtotal
            });
        }

        // Recalculate the total price based on all subtotals
        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

        // Save the cart to the database
        await cart.save();

        // Send the response with the updated cart
        res.status(201).send({
            message: 'Item added to cart successfully',
            cart: cart
        });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




// Update Cart
module.exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, newQuantity } = req.body;

        // check productid and quanty is valid given by user
        if (!productId || !newQuantity || newQuantity < 1) {
            return res.status(400).send({ message: 'Please Provide Valid Product ID and Quantity.' });
        }

        // Find the cart for the current user
        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found.' });
        }

        // Find the product in the Cart to update
        const productIndex = cart.cartItems.findIndex(item => item.productId === productId);
        if (productIndex === -1) {
            return res.status(404).send({ message: 'The product is not yet added in your cart.' });
        }

        // Fetch product from Product Collection to get price of product to re calculate subtotel.
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ message: 'The Product You want to update is not in our database.' });
        }

        // Calculate updated subtotal
        const price = product.price; // Assuming 'price' is a field in the Product model
        cart.cartItems[productIndex].quantity = newQuantity;
        cart.cartItems[productIndex].subtotal = price * newQuantity; // Recalculate subtotal

        // Calculate new totalPrice.
        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

        // Save updated data in our database
        await cart.save();
        res.status(200).send({
            message: 'Item quantity updated successfully',
            updatedCart: cart
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Remove item from cart
module.exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        // find cart of current loggedin user
        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

        // Find the product index in the cartItems array
        const productIndex = cart.cartItems.findIndex(item => item.productId === productId);
        if (productIndex === -1) {
            return res.status(404).send({ message: 'Item not found in cart' });
        }

        // removing product item from cartItems array.
        cart.cartItems.splice(productIndex, 1);

        //recalculating total price
        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

        await cart.save();
        res.status(200).send({
            message: 'Item removed from cart successfully',
            updatedCart: cart
        });

    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

// Clear Cart
module.exports.clearCart = async (req, res) => {
    try {
        // find cart for current user
        let cart = await Cart.findOne({userId: req.user.id});
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found.' });
        }

        // clearing cart
        cart.cartItems = [];
        cart.totalPrice = 0;
        cart.orderedOn = null;

        // saving cleared cart
        await cart.save();
        res.status(200).send({
            message: 'Cart cleared successfully',
            cart: cart
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};
