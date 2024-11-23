const mongoose = require('mongoose');

//User schema
const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    password: {
        type: String,
        required: true,
        minlength: 7
    },
    rol: {
        type: String,
        required: true,
        enum: ['admin', 'physio', 'patient']
    }
});

// Export model
let User = mongoose.model('users', userSchema);
module.exports = User;

