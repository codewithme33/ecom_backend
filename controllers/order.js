const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");
const bcrypt = require("bcrypt");
const {errorHandler} = require("../auth.js");

// checkout
module.exports.checkOut = async (req, res) => {
    try {
        const userId = req.user.id;

        // Finding current user's cart
        const cart = await Cart.findOne({ userId });
        
        // checking there is cart and it has item or not
        if (!cart) {
            return res.status(404).send({ message: 'No cart found for this user' });
        }

        if(cart.cartItems.length === 0){
            return res.status(400).send({error: 'No Items to checkout'});
        }

        // creating new object based on cart
        const newOrder = new Order({
            userId: userId,
            productsOrdered: cart.cartItems,
            totalPrice: cart.totalPrice
        });

        // saving order in database
        const savedOrder = await newOrder.save();

        // clearing cart
        await Cart.findByIdAndDelete(cart._id);
        return res.status(200).send({
            message: 'Ordered Successfully'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
};


// get user's order
module.exports.myOrders = async (req, res) => {
    try {
         const orders = await Order.find({ userId: req.user.id });

        // checking there are order or not
        if (orders.length > 0) {
            return res.status(200).send({orders});
        } else {
            return res.status(404).send({message: 'No orders found' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
};

//get all order
module.exports.allOrders = async (req, res) => {
    try {
         const orders = await Order.find({});

        // checking there are order or not
        if (orders.length > 0) {
            return res.status(200).send({orders});
        } else {
            return res.status(404).send({message: 'No orders found' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({error: 'Internal Server Error' });
    }
};