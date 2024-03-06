const User = require('../models/usermodel');
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
      await User.findByIdAndDelete(userId);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUserById = async (req, res) => {
    const email  = req.body.email;

    // Query the MongoDB database to find the user with the corresponding email
    User.findOne({ email })
        .select('_id') // Select only the _id field
        .exec()
        .then(user => {
            if (!user) {
                // If user with the provided email is not found, return 404 Not Found
                return res.status(404).json({ message: 'User not found' });
            }
            // If user is found, return their ID in the response
            res.json({ userId: user._id });
        })
        .catch(err => {
            // Handle database query error
            console.error('Error finding user:', err);
            return res.status(500).json({ message: 'Internal server error' });
        });
};
