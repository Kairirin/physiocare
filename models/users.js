const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        minlenght: 4,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlenght: 7
    },
    rol: {
        type: String,
        required: true,
        enum: ['admin', 'physio', 'patient']
    }
});

let User = mongoose.model('users', userSchema);
module.exports = User;