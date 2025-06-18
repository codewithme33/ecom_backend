const mongoose = require("mongoose");


const orderSchema= new mongoose.Schema({
	userId: {
		type: String,
		required: [true, 'User Id is required.']
	},
	productsOrdered: [
	        {
	        	productId:{
	        		type: String,
	        		required: [true, 'Order Id for enrollment is required.']
	        	},
	        	quantity:{
	        		type: Number,
	        		required: [true, 'The quantity should be mentioned.']
	        	},
	        	subtotal:{
	        		type: Number,
	        		default: "Total product displayed."
	        	}
	        }   

	],
	totalPrice: {
		type: Number,
		required: [true, 'Total price id required!']
	},
	orderedOn: {
		type: Date,
		default: Date.now 
	},
	status: {
		type: String,
		dafault: "Pending"
	}
})


module.exports = mongoose.model("Order", orderSchema);
