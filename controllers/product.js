const Product = require("../models/Product.js");
const { errorHandler } = require("../auth.js");
//Adding a product(Admin Only):
module.exports.addProduct = (req, res) => {
    
    let newProduct = new Product({
        name : req.body.name,
        description : req.body.description,
        price : req.body.price
    });

    
    Product.findOne({ name: req.body.name })
    .then(existingProduct =>{
       
        if(existingProduct){
            res.status(409).send({ message: 'Product already exists'})
        }else{
            
            return newProduct.save().then(result => res.status(201).send(
                result
            )).catch(error => errorHandler(error, req, res));
        }
    }).catch(error => errorHandler(error, req, res))

}; 

//Retrieve all products(Admin Only):
module.exports.getAllProducts = (req, res) => {
    return Product.find({})
    .then(result => {
        if(result.length > 0){
            return res.status(200).send(result);
        }
        else{
            return res.status(404).send({ message: "No Products found" });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

//Retrieve all active products
module.exports.getAllActive = (req, res) => {

    Product.find({ isActive: true })
    .then(result =>{

        if(result.length > 0){
           return res.status(200).send(result)
        }
        else {
            return res.status(404).send({ message: 'No active products found'});
        }
    }).catch(error => errorHandler(error, req, res));

};

//Retrieve single product
module.exports.getProduct = (req, res) => {
    Product.findById(req.params.id)
    .then(product => {
        if(product) {
            return res.status(200).send(product);
        } else {
            return res.status(404).send({ message: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};


//Update product information(Admin Only):
module.exports.updateProduct = (req, res) => {
    //updated Product object
    let updatedProduct = {
        name : req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {

        if(product){
            res.status(200).send( { success: true, message: 'Product updated successfully' } );
        }else{
            res.status(404).send( { message: 'Product not found'} );
        }

    })
    .catch(error => errorHandler(error,req,res));
}

//Archieve Product (Admin Only)
module.exports.archiveProduct = (req, res) => {
  
    let updateActiveField = {
        isActive: false
    };

    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
        .then(product => {
            if (product) {
                if (!product.isActive) {
                    return res.status(200).send({
                        message: 'Product already archived',
                        product: product
                    });
                }   
                return res.status(200).send({
                    success: true,
                    message: 'Product archived successfully'
                });
            } else {
                return res.status(404).send("Product not found");
            }
        })
        .catch(error => errorHandler(error, req, res));
};

//Activate Product(Admin Only):
module.exports.activateProduct = (req, res) => {
  
    let updateActiveField = {
        isActive: true
    }

    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
        .then(product => {
            if (product) {
                if (product.isActive) {
                    return res.status(200).send({
                        message: 'Product already activated',
                        product: product
                    });
                }
                return res.status(200).send({
                    success: true,
                    message: 'Product activated successfully'
                });
            } else {
                return res.status(404).send(false);
            }
        })
        .catch(error => errorHandler(error, req, res));

};



module.exports.searchByName = async (req, res) => {
    try {
        
        const products = await Product.find({ name: { $regex: req.body.name, $options: 'i' } });

       
        if (products.length > 0) {
            return res.status(200).send(products);
        } else {
            return res.status(404).send({ message: 'No products found matching the search term.' });
        }

    } catch (error) {
        errorHandler(error, req, res);
    }
};


module.exports.searchByPriceRange = async (req, res) => {
    try {
        const minPrice = req.body.minPrice;
        const maxPrice = req.body.maxPrice;
        // Validate the input
        if (minPrice == null || maxPrice == null) {
            return res.status(400).send({ message: 'Both minPrice and maxPrice are required' });
        }

        if (minPrice > maxPrice) {
            return res.status(400).send({ message: 'minPrice is Greater then maxPrice' });
        }

        // find by price range
        const products = await Product.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });

        // check product found or not
        
            return res.status(200).send(products);
      

    } catch (error) {
        errorHandler(error, req, res);
    }
};



