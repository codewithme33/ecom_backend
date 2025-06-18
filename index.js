const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");


const cors = require("cors");

const productRoutes = require("./routes/product.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");
const userRoutes = require("./routes/user.js");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.use( "/b5/products",productRoutes);
app.use("/b5/orders",orderRoutes);
app.use("/b5/users",userRoutes);
app.use("/b5/cart",cartRoutes);


mongoose.connect(process.env.MONGODB_STRING);

let db = mongoose.connection;
db.on("error", console.error.bind(console, "Error in the database connection!"));
db.once("open", ()=> console.log("Now connected to MongoDB Atlas."));



if(require.main === module){
    app.listen(process.env.PORT || 3000, ()=> {
        console.log(`API is now running at port ${process.env.PORT || 3000}`);
	})
	};

module.exports = { app, mongoose};
