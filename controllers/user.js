const bcrypt = require("bcrypt");
const auth = require("../auth.js"); 
const User = require("../models/User.js"); 
const { errorHandler } = require("../auth.js"); 

module.exports.registerUser = (req, res) => {

       // Checks if the email is in the right format
	console.log(req.body);
	//check if the email has @ symbol
    if (!req.body.email.includes("@")){
        return res.status(400).send({ message: 'Email invalid' });
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({ message: 'Mobile number invalid'});
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters'});
    // If all needed requirements are achieved
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({
            message: 'User registered successfully',
            user: result
        }))
        .catch(error => errorHandler(error, req, res));
    }
};

module.exports.loginUser = (req, res) => {

    if(req.body.email.includes("@")){

        return User.findOne({ email : req.body.email })
        .then(result => {
            if(result == null){
                return res.status(404).send({ error: 'No Email Found'});
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if (isPasswordCorrect) {
                    return res.status(200).send({
                       access : auth.createAccessToken(result)
                    });
                } else {
                    //401 - unauthorized
                    return res.status(401).send({ error: 'Email and password do not match'});
                }
            }
        })
        .catch(error => errorHandler(error, req, res));
    }else{
        return res.status(400).send({ error: 'Invalid Email' })
    }
};


module.exports.getProfile = (req, res) => {
	console.log(req.user);
    return User.findById(req.user.id)
    .then(user => {

        if(!user){
            //if the user has an invalid token
            return res.status(404).send({ message: 'User not found'})
        }else{
            user.password = "";
            //For a get request, 200 means that the server processed the request successfully and returned a response back to the client without any errors
            return res.status(200).send({user : user});
        }
        
    })
    .catch(error => errorHandler(error, req, res));
};




module.exports.resetPassword = async (req, res) => {
  try {

    console.log(req.body);
    console.log(req.user);
    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(200).send({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
};


//[Section] Controller function to update the user profile
module.exports.updateProfile = async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;

    // Retrieve the updated profile information from the request body
    const { firstName, lastName, mobileNumber } = req.body;

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNumber },
      { new: true }
    );

    res.send(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to update profile' });
  }
}


// Controller function to set a user's isAdmin status to true
module.exports.updateAdmin = async (req, res, next) => {
  try {
      const userId = req.params.id;
      const user = await User.findById(userId);

      // Check if user exists
      if (!user) {
          const error = new Error('User not found');
          error.status = 404;
          return next(error);
      }

      // Update user's admin status
      user.isAdmin = true;
      await user.save();

      res.status(200).json({
          updatedUser : user
      });
  } catch (error) {
      next(error); 
  }
};
